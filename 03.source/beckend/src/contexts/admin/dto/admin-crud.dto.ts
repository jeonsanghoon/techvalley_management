/**
 * @file admin-crud.dto.ts
 * @description 관리 CRUD 요청 본문·파라미터 검증 DTO.
 *              사용자·공통코드 POST/PUT 본문 필드 형식 및 길이를 검증한다.
 */
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 공통코드 생성 요청 DTO.
 * POST /api/admin/codes — main_code(5자)·sub_code·code_name 필수.
 */
export class CreateCommonCodeDto {
  @IsString()
  @MaxLength(5)
  main_code: string;

  @IsInt()
  sub_code: number;

  @IsString()
  @MaxLength(100)
  code_name: string;

  @IsOptional()
  @IsInt()
  order_seq?: number;
}

/**
 * 공통코드 수정 요청 DTO.
 * PUT /api/admin/codes/:id — code_name·order_seq·is_use 부분 갱신.
 */
export class UpdateCommonCodeDto {
  @IsOptional()
  @IsString()
  code_name?: string;

  @IsOptional()
  @IsInt()
  order_seq?: number;

  @IsOptional()
  @IsBoolean()
  is_use?: boolean;
}

/**
 * 사용자 생성 요청 DTO.
 * POST /api/admin/users — code 필수, email·user_name·auth_type 선택.
 */
export class CreateUserDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsInt()
  auth_type?: number;
}

/**
 * 사용자 수정 요청 DTO.
 * PUT /api/admin/users/:id — 프로필·계정 상태·is_use 부분 갱신.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsBoolean()
  is_use?: boolean;

  @IsOptional()
  @IsString()
  account_status?: string;
}

/** 정수 ID 경로 파라미터 검증 DTO. */
export class IntIdParamDto {
  @IsNotEmpty()
  id: string;
}
