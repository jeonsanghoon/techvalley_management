import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** JWT Guard 예외 — login, health 등 인증 불필요 API */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
