// dto/update-user.dto.ts
import { IsBoolean, IsString, IsOptional, IsUrl, IsObject, MinLength, MaxLength } from 'class-validator';

export class SaveCvDraftDto {
  @IsObject() data: Record<string, unknown>;
}

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) firstName?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsUrl() avatarUrl?: string | null;
  @IsOptional() @IsString() telegramId?: string;

  // New Job Seeker fields
  @IsOptional() @IsString() headline?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsUrl() defaultResumeUrl?: string;
  @IsOptional() @IsUrl() portfolioUrl?: string;
  @IsOptional() @IsUrl() githubUrl?: string;
  @IsOptional() @IsUrl() linkedinUrl?: string;
  @IsOptional() @IsString({ each: true }) skills?: string[];
}

export class ChangePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(8) @MaxLength(128) newPassword: string;
}

export class NotificationPreferencesDto {
  @IsBoolean() emailNotifications: boolean;
  @IsBoolean() inAppNotifications: boolean;
  @IsBoolean() jobAlerts: boolean;
}

export class CreateCompanyDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
  @IsOptional() @IsUrl() website?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() size?: string;

  // New Company fields
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsUrl() linkedinUrl?: string;
  @IsOptional() @IsUrl() twitterUrl?: string;
  @IsOptional() @IsUrl() facebookUrl?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsString({ each: true }) benefits?: string[];
  @IsOptional() foundedYear?: number;
}
