/**
 * @file service-crud.dto.ts
 * @description 서비스 데스크 CRUD 요청 본문·파라미터 검증 DTO.
 *              티켓 생성·수정 시 필수/선택 필드 및 길이 제한을 검증한다.
 */
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 서비스 티켓 생성 요청 DTO.
 * POST /api/service/tickets — ticket_no·device_code·title 필수, status·priority 기본값은 서비스에서 설정.
 */
export class CreateServiceTicketDto {
  @IsString()
  @MaxLength(64)
  ticket_no: string;

  @IsString()
  @MaxLength(64)
  device_code: string;

  @IsOptional()
  @IsInt()
  device_id?: number;

  @IsOptional()
  @IsInt()
  site_id?: number;

  @IsOptional()
  @IsString()
  ticket_status?: string;

  @IsOptional()
  @IsInt()
  priority_type?: number;

  @IsString()
  @MaxLength(512)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 서비스 티켓 수정 요청 DTO.
 * PUT /api/service/tickets/:id — 상태·우선순위·제목·설명·site_id 부분 갱신.
 */
export class UpdateServiceTicketDto {
  @IsOptional()
  @IsString()
  ticket_status?: string;

  @IsOptional()
  @IsInt()
  priority_type?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  site_id?: number;
}

/** 티켓 Snowflake/UUID 경로 파라미터 검증 DTO. */
export class TicketIdParamDto {
  @IsNotEmpty()
  id: string;
}
