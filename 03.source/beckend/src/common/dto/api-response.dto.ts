/**
 * @file api-response.dto.ts
 * @description API 공통 응답 envelope — 프론트 `fetchJson`이 `{ data, meta }` unwrap.
 */
import type { BatchMetaDto } from './batch-meta.dto';

/** `{ data, meta }` 래퍼 — frontend `fetchJson` unwrap 대상 */
export interface ApiDataEnvelopeDto<T> {
  data: T;
  meta: BatchMetaDto;
}

/** 목록 응답 data 페이로드 — `{ items: T[] }` */
export interface ItemsDto<T> {
  items: T[];
}

/** GET /health 응답 */
export interface HealthResponseDto {
  ok: true;
  service: string;
}

/** Service 계층에서 data + batchMeta를 envelope로 감싸 반환 */
export function wrapApiData<T>(data: T, meta: BatchMetaDto): ApiDataEnvelopeDto<T> {
  return { data, meta };
}
