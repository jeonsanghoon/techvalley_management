import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_CONFIG } from '../auth.config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthTokenVerifierService } from '../services/auth-token-verifier.service';

/**
 * 전역 JWT Guard — Authorization: Bearer {token}
 * AUTH_ENABLED=false 또는 @Public() 시 통과.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: AuthTokenVerifierService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!AUTH_CONFIG.enabled) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: unknown;
    }>();

    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = header.slice('Bearer '.length).trim();
    request.user = await this.verifier.verifyBearerToken(token);
    return true;
  }
}
