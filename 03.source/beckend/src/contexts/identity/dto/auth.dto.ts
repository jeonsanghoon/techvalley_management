/**
 * @file auth.dto.ts
 * @description 인증 API 요청·응답 DTO.
 */
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import type { UserAccountDto } from '../../service/dto/service.dto';

export class LoginRequestDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  password?: string;
}

export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  /** Cognito 모드에서만 */
  idToken?: string;
}

export interface LoginResponseDto {
  user: UserAccountDto;
  tokens: AuthTokensDto;
  provider: 'local' | 'aws';
}

export interface AuthUsersResponseDto {
  items: UserAccountDto[];
}

export interface AuthConfigResponseDto {
  provider: 'local' | 'aws';
  cognito?: {
    region: string;
    userPoolId: string;
    clientId: string;
    enabled: boolean;
  };
}

export interface MeResponseDto {
  user: UserAccountDto;
  claims: {
    sub: string;
    role: string;
    companyId?: number;
    branchId?: number;
    siteId?: number;
  };
}

export function resolveLoginId(dto: LoginRequestDto): string {
  return (dto.userId ?? dto.email ?? '').trim();
}
