import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength, IsArray } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

enum ManagedRole {
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  FREELANCER = 'FREELANCER',
  ADMIN = 'ADMIN',
}
class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(2) firstName: string;
  @IsString() @MinLength(2) lastName: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(ManagedRole) role: ManagedRole;
}
class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(2) firstName?: string;
  @IsOptional() @IsString() @MinLength(2) lastName?: string;
  @IsOptional() @IsEnum(ManagedRole) role?: ManagedRole;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
class BroadcastDto {
  @IsString() @MinLength(3) title: string;
  @IsString() @MinLength(5) body: string;
  @IsOptional() @IsEnum(ManagedRole) role?: ManagedRole;
  @IsOptional() @IsArray() @IsString({ each: true }) userIds?: string[];
}
class ResolveDisputeDto {
  @IsString() @MinLength(10) resolution: string;
}

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
} as const;

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers() {
    return this.prisma.user.findMany({ select: safeUserSelect, orderBy: { createdAt: 'desc' } });
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a user' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        passwordHash: await bcrypt.hash(dto.password, 12),
        role: dto.role,
      },
      select: safeUserSelect,
    });
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto, select: safeUserSelect });
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user without dependent records' })
  async deleteUser(@Param('id') id: string, @CurrentUser() admin: CurrentUserPayload) {
    if (id === admin.userId)
      return { deleted: false, reason: 'You cannot delete your own admin account' };
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  @Get('contacts')
  getContacts() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Patch('contacts/:id/status')
  updateContact(@Param('id') id: string, @Body() body: { status: 'NEW' | 'READ' | 'RESOLVED' }) {
    return this.prisma.contactMessage.update({ where: { id }, data: { status: body.status } });
  }

  @Post('notifications/broadcast')
  async broadcast(@Body() dto: BroadcastDto) {
    let users;
    if (dto.userIds && dto.userIds.length > 0) {
      users = await this.prisma.user.findMany({
        where: { id: { in: dto.userIds }, isActive: true },
        select: { id: true },
      });
    } else {
      users = await this.prisma.user.findMany({
        where: { isActive: true, ...(dto.role && { role: dto.role }) },
        select: { id: true },
      });
    }

    if (users.length === 0) {
      return { delivered: 0 };
    }

    const result = await this.prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        channel: 'IN_APP',
        type: 'ADMIN_ANNOUNCEMENT',
        title: dto.title,
        body: dto.body,
      })),
    });
    return { delivered: result.count };
  }

  @Get('escrow/disputes')
  getDisputes() {
    return this.prisma.dispute.findMany({
      include: { contract: { include: { freelanceJob: true, client: true, freelancer: true } } },
    });
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.prisma.dispute.update({
      where: { id },
      data: { resolution: dto.resolution, resolvedAt: new Date() },
    });
  }
}
