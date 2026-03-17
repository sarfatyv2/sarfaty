import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'key must be lowercase letters, digits, or underscores, starting with a letter' })
  key!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  label!: string;

  @IsString()
  @IsNotEmpty()
  homeRoute!: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  label?: string;

  @IsString()
  @IsOptional()
  homeRoute?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SetPermissionsDto {
  @IsString({ each: true })
  featureKeys!: string[];
}

export class ToggleModuleDto {
  @IsBoolean()
  enabled!: boolean;
}
