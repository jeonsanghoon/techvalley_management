/**
 * @file parts-crud.dto.ts
 * @description 부품 CRUD 요청 본문·파라미터 검증 DTO.
 *              주문·교체 일정 생성·수정 시 필수 필드 및 수량 최소값을 검증한다.
 */
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * 부품 주문 생성 요청 DTO.
 * POST /api/parts/orders — order_no·part_type_code 필수, quantity 최소 1.
 */
export class CreatePartsOrderDto {
  @IsString()
  @MaxLength(64)
  order_no: string;

  @IsOptional()
  @IsString()
  device_code?: string;

  @IsString()
  @MaxLength(32)
  part_type_code: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  order_status?: string;
}

/**
 * 부품 주문 수정 요청 DTO.
 * PUT /api/parts/orders/:id — order_status·quantity 부분 갱신.
 */
export class UpdatePartsOrderDto {
  @IsOptional()
  @IsString()
  order_status?: string;

  @IsOptional()
  @IsInt()
  quantity?: number;
}

/**
 * 부품 교체 일정 생성 요청 DTO.
 * POST /api/parts/schedules — device_code·part_type_code·scheduled_at(ISO) 필수.
 */
export class CreatePartsScheduleDto {
  @IsString()
  device_code: string;

  @IsString()
  part_type_code: string;

  @IsString()
  scheduled_at: string;

  @IsOptional()
  @IsString()
  schedule_status?: string;
}

/**
 * 부품 교체 일정 수정 요청 DTO.
 * PUT /api/parts/schedules/:id — schedule_status·scheduled_at 부분 갱신.
 */
export class UpdatePartsScheduleDto {
  @IsOptional()
  @IsString()
  schedule_status?: string;

  @IsOptional()
  @IsString()
  scheduled_at?: string;
}

/** Snowflake ID 경로 파라미터 검증 DTO. */
export class SnowflakeIdParamDto {
  @IsNotEmpty()
  id: string;
}
