/**
 * @file crud.dto.ts
 * @description CRUD API 공통 DTO — 경로 파라미터, 페이지네이션 쿼리, 목록 응답 래퍼 타입.
 *              각 컨텍스트의 *-crud.dto.ts 와 함께 ValidationPipe 에 의해 검증된다.
 */
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * 문자열 ID 경로 파라미터 DTO.
 * `@Param('id')` 바인딩 시 non-empty 문자열 검증 (UUID·Snowflake 등).
 */
export class IdParamDto {
  @IsString()
  id: string;
}

/**
 * 목록 조회 페이지네이션 쿼리 DTO.
 * `GET` 목록 API의 `?limit=&offset=` 쿼리 검증. 기본 limit=100, offset=0.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

/**
 * CRUD 목록 응답 공통 형태.
 * @template T 개별 항목 DTO 타입
 */
export interface CrudListResponseDto<T> {
  items: T[];
  total?: number;
}
