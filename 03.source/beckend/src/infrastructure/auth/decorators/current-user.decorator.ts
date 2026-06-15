import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthPayload } from '../types/auth-payload.types';

/** 컨트롤러 핸들러에서 `@CurrentUser()` 로 JWT payload 주입 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthPayload }>();
    return request.user;
  },
);
