/**
 * @file installation-crud.dto.ts
 * @description 설치 CRUD 요청 본문·파라미터 검증 DTO.
 *              설치 등록·수정 시 device_code·site_id·installed_at 등을 검증한다.
 */
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 설치 이력 생성 요청 DTO.
 * POST /api/installation — device_code·site_id·installed_at(ISO) 필수.
 */
export class CreateInstallationDto {
  @IsString()
  device_code: string;

  @IsOptional()
  @IsInt()
  device_id?: number;

  @IsInt()
  site_id: number;

  @IsString()
  installed_at: string;

  @IsOptional()
  @IsString()
  installer_note?: string;
}

/**
 * 설치 이력 수정 요청 DTO.
 * PUT /api/installation/:id — device·site·일시·메모 부분 갱신.
 */
export class UpdateInstallationDto {
  @IsOptional()
  @IsString()
  device_code?: string;

  @IsOptional()
  @IsInt()
  site_id?: number;

  @IsOptional()
  @IsString()
  installed_at?: string;

  @IsOptional()
  @IsString()
  installer_note?: string;
}

/** 설치 Snowflake ID 경로 파라미터 검증 DTO. */
export class InstallationIdParamDto {
  @IsNotEmpty()
  id: string;
}
