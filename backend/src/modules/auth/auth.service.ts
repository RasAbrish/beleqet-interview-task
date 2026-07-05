import {
  Injectable, UnauthorizedException, ConflictException, Logger, NotFoundException, BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES, NOTIFICATION_JOBS } from '../queues/queues.constants';
import { passwordResetEmail, verificationEmail, loginAlertEmail, logoutAlertEmail, welcomeEmail } from '../notifications/email-templates';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Resolves the public frontend base URL used to build links in emails
   * (verification, password reset, welcome). In every environment this comes
   * from FRONTEND_URL — set to https://beleqet-frontend.onrender.com in
   * render.yaml for production and to the local host in dev. We only fall back
   * to localhost outside production; if it is missing in production we log an
   * error instead of silently emitting broken localhost links.
   */
  private frontendUrl(): string {
    const url = this.config.get<string>('FRONTEND_URL');
    if (url) return url.replace(/\/+$/, '');
    if (this.config.get<string>('NODE_ENV') === 'production')
      this.logger.error(
        'FRONTEND_URL is not set in production — email links may be broken.',
      );
    return 'http://localhost:3000';
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? 'JOB_SEEKER',
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    this.logger.log(`New user registered: ${user.email} (${user.role})`);

    // Fire-and-forget: email queue failures must NOT crash registration
    this.sendVerificationEmail(user.id).catch((err) =>
      this.logger.error(`Failed to enqueue verification email for ${user.email}: ${err.message}`)
    );

    // Send personalised welcome email
    const frontendUrl = this.frontendUrl();
    const dashboardUrl = user.role === 'EMPLOYER'
      ? `${frontendUrl}/employer`
      : user.role === 'FREELANCER'
      ? `${frontendUrl}/profile`
      : `${frontendUrl}/jobs`;
    welcomeEmail(user.firstName, user.role, dashboardUrl)
      .then((email) =>
        this.notificationsQueue.add(NOTIFICATION_JOBS.SEND_EMAIL, {
          to: user.email,
          subject: `Welcome to Beleqet, ${user.firstName}!`,
          ...email,
        })
      )
      .catch((err) =>
        this.logger.error(`Failed to enqueue welcome email for ${user.email}: ${err.message}`)
      );

    return this.issueTokens(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: { id: string; email: string; firstName: string; lastName: string; role: string }, userAgent?: string) {
    loginAlertEmail(user.firstName, userAgent)
      .then((email) =>
        this.notificationsQueue.add(NOTIFICATION_JOBS.SEND_EMAIL, {
          to: user.email,
          subject: 'New login detected on your Beleqet account',
          ...email,
        })
      )
      .catch((err) =>
        this.logger.error(`Failed to enqueue login alert email for ${user.email}: ${err.message}`)
      );
    return this.issueTokens(user);
  }

  async refresh(token: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Atomically claim the token. Concurrent refresh requests may both read the
    // same row, but only one is allowed to delete (and therefore rotate) it.
    const claimed = await this.prisma.refreshToken.deleteMany({
      where: { id: storedToken.id, token },
    });
    if (claimed.count !== 1) {
      throw new UnauthorizedException('Refresh token has already been used');
    }
    return this.issueTokens(storedToken.user);
  }

  async logout(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    if (user) {
      logoutAlertEmail(user.firstName)
        .then((email) =>
          this.notificationsQueue.add(NOTIFICATION_JOBS.SEND_EMAIL, {
            to: user.email,
            subject: 'You have logged out from Beleqet',
            ...email,
          })
        )
        .catch((err) =>
          this.logger.error(`Failed to enqueue logout alert email for ${user.email}: ${err.message}`)
        );
    }
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const token = uuidv4();
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    const verifyUrl = `${this.frontendUrl()}/auth/verify-email?token=${token}`;
    const email = await verificationEmail(user.firstName, verifyUrl);

    await this.notificationsQueue.add(NOTIFICATION_JOBS.SEND_EMAIL, {
      to: user.email,
      subject: 'Verify your Beleqet Account',
      ...email,
    });
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({ where: { token } });
    if (!verificationToken || verificationToken.type !== 'EMAIL_VERIFICATION' || verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    });

    await this.prisma.verificationToken.delete({ where: { id: verificationToken.id } });
    return { success: true, message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { success: true, message: 'If an account exists, a reset link was sent.' };

    const token = uuidv4();
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      }
    });

    const resetUrl = `${this.frontendUrl()}/auth/reset-password?token=${token}`;
    const emailContent = await passwordResetEmail(user.firstName, resetUrl);

    await this.notificationsQueue.add(NOTIFICATION_JOBS.SEND_EMAIL, {
      to: user.email,
      subject: 'Reset your Beleqet Password',
      ...emailContent,
    });

    return { success: true, message: 'If an account exists, a reset link was sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({ where: { token } });
    if (!verificationToken || verificationToken.type !== 'PASSWORD_RESET' || verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: { passwordHash }
    });

    await this.prisma.verificationToken.deleteMany({ where: { userId: verificationToken.userId, type: 'PASSWORD_RESET' } });
    return { success: true, message: 'Password reset successfully' };
  }

  private async issueTokens(user: { id: string; email: string; firstName: string; lastName: string; role: string; avatarUrl?: string | null }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES', '15m'),
    });

    const refreshTokenStr = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: { token: refreshTokenStr, userId: user.id, expiresAt },
    });

    // Enforce a cap of 5 active refresh tokens per user (prevent session proliferation)
    const MAX_SESSIONS = 5;
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (tokens.length > MAX_SESSIONS) {
      const toDelete = tokens.slice(0, tokens.length - MAX_SESSIONS).map(t => t.id);
      await this.prisma.refreshToken.deleteMany({ where: { id: { in: toDelete } } });
    }

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
    };
  }
}
