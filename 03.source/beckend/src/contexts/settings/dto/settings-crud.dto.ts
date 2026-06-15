/**
 * @file settings-crud.dto.ts
 * @description 설정 CRUD 요청 본문·파라미터 검증 DTO.
 *              알림 채널 생성·수정 시 채널 유형·대상·심각도 필터 등을 검증한다.
 */
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 알림 채널 생성 요청 DTO.
 * POST /api/settings/notification-channels — channel_code·channel_name·channel_type·target 필수.
 */
export class CreateNotificationChannelDto {
  @IsString()
  @MaxLength(64)
  channel_code: string;

  @IsString()
  @MaxLength(128)
  channel_name: string;

  @IsString()
  @MaxLength(24)
  channel_type: string;

  @IsString()
  @MaxLength(512)
  target: string;

  @IsOptional()
  severity_filter?: string[];

  @IsOptional()
  @IsString()
  recipients?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 알림 채널 수정 요청 DTO.
 * PUT /api/settings/notification-channels/:id — 이름·대상·필터·수신자·enabled 부분 갱신.
 */
export class UpdateNotificationChannelDto {
  @IsOptional()
  @IsString()
  channel_name?: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsOptional()
  severity_filter?: string[];

  @IsOptional()
  @IsString()
  recipients?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

/** Snowflake ID 경로 파라미터 검증 DTO. */
export class SnowflakeIdParamDto {
  @IsNotEmpty()
  id: string;
}
