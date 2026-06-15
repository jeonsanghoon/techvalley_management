/**
 * @file organization-crud.dto.ts
 * @description 조직 CRUD 요청 본문·파라미터 검증 DTO.
 *              class-validator 데코레이터로 POST/PUT 본문 및 경로 id 형식을 검증한다.
 */
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 고객사 생성 요청 DTO.
 * POST /api/companies 본문 — code·company_name 필수, 선택 속성(유형·계약 등) 검증.
 */
export class CreateCompanyDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(255)
  company_name: string;

  @IsOptional()
  @IsString()
  company_type?: string;

  @IsOptional()
  @IsString()
  contract_tier?: string;

  @IsOptional()
  @IsString()
  region_label?: string;
}

/**
 * 고객사 수정 요청 DTO.
 * PUT /api/companies/:id 본문 — 모든 필드 선택, is_use 로 활성/비활성 토글 가능.
 */
export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  company_type?: string;

  @IsOptional()
  @IsString()
  contract_tier?: string;

  @IsOptional()
  @IsString()
  region_label?: string;

  @IsOptional()
  @IsBoolean()
  is_use?: boolean;
}

/**
 * 현장 생성 요청 DTO.
 * POST /api/sites 본문 — code·site_name 필수, company_id·branch_id 등 FK 선택.
 */
export class CreateSiteDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(255)
  site_name: string;

  @IsOptional()
  @IsInt()
  company_id?: number;

  @IsOptional()
  @IsInt()
  branch_id?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  region_label?: string;

  @IsOptional()
  @IsString()
  geo_zone?: string;
}

/**
 * 현장 수정 요청 DTO.
 * PUT /api/sites/:id 본문 — 부분 갱신, is_use 로 소프트 삭제 복구·비활성화 가능.
 */
export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  site_name?: string;

  @IsOptional()
  @IsInt()
  company_id?: number;

  @IsOptional()
  @IsInt()
  branch_id?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  region_label?: string;

  @IsOptional()
  @IsString()
  geo_zone?: string;

  @IsOptional()
  @IsBoolean()
  is_use?: boolean;
}

/** 정수 ID 경로 파라미터 검증 DTO (수동 파이프 사용 시). */
export class IdParamIntDto {
  @IsNotEmpty()
  id: string;
}
