import { IsEmail, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

export enum UserFilterType {
  ALL = 'all',
  PET_OWNER = 'PET_OWNER',
  VETERINARIAN = 'VETERINARIAN',
  ADMIN = 'ADMIN',
}

export class FilterUsersDto {
  @IsOptional()
  @IsEnum(UserFilterType)
  type?: UserFilterType = UserFilterType.ALL;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateUserStatusDto {
  @IsEnum(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsEnum(['SUSPEND', 'ACTIVATE', 'DELETE'])
  action: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
