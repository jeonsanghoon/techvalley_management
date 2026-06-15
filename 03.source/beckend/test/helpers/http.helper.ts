import type { Response } from 'supertest';

/** wrapData envelope 또는 plain body 에서 items 추출 */
export function unwrapItems<T>(res: Response): T[] {
  const body = res.body;
  if (body?.data?.items) return body.data.items as T[];
  if (body?.items) return body.items as T[];
  return [];
}

export function unwrapData<T>(res: Response): T {
  const body = res.body;
  if (body?.data !== undefined) return body.data as T;
  return body as T;
}

export function uniqueCode(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}
