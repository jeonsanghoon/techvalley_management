/**
 * @file identity.service.ts
 * @description 로컬 JWT · AWS Cognito 인증 비즈니스 로직.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { mapUser, batchMeta, wrapData } from '../../../common/mappers';
import { AUTH_CONFIG } from '../../../infrastructure/auth/auth.config';
import { CognitoAuthService } from '../../../infrastructure/auth/services/cognito-auth.service';
import { LocalTokenService } from '../../../infrastructure/auth/services/local-token.service';
import { authTypeToRole } from '../../../infrastructure/auth/services/auth-role.util';
import type { AuthPayload } from '../../../infrastructure/auth/types/auth-payload.types';
import { IdentityDao } from '../dao/identity.dao';
import type { UserAccountDto } from '../../service/dto/service.dto';
import type {
  AuthConfigResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  MeResponseDto,
  RefreshTokenRequestDto,
} from '../dto/auth.dto';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import { resolveLoginId } from '../dto/auth.dto';
import type { UserRow } from '../../../common/types/db/postgres-rows';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class IdentityService {
  constructor(
    private readonly dao: IdentityDao,
    private readonly localToken: LocalTokenService,
    private readonly cognito: CognitoAuthService,
  ) {}

  async listUsers(): Promise<ApiDataEnvelopeDto<ItemsDto<UserAccountDto>>> {
    const { rows } = await this.dao.findActiveUsers();
    return wrapData(
      { items: rows.map((r) => mapUser(r as UserRow)) },
      batchMeta('postgres.user'),
    );
  }

  getAuthConfig(): AuthConfigResponseDto {
    return {
      provider: AUTH_CONFIG.provider,
      cognito: AUTH_CONFIG.provider === 'aws' ? this.cognito.getPublicConfig() : undefined,
    };
  }

  async login(dto: LoginRequestDto): Promise<ApiDataEnvelopeDto<LoginResponseDto>> {
    if (AUTH_CONFIG.provider === 'aws') {
      return this.loginWithCognito(dto);
    }
    return this.loginWithLocalJwt(dto);
  }

  async refresh(dto: RefreshTokenRequestDto): Promise<LoginResponseDto['tokens']> {
    if (AUTH_CONFIG.provider === 'aws') {
      const tokens = await this.cognito.refreshTokens(dto.refreshToken);
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        idToken: tokens.idToken,
        expiresIn: tokens.expiresIn,
        tokenType: 'Bearer',
      };
    }

    const { sub } = this.localToken.verifyRefreshToken(dto.refreshToken);
    const user = await this.dao.findEntityById(Number(sub));
    if (!user || !user.is_use) throw new UnauthorizedException('User not found');
    const authPayload = this.buildAuthPayload(user);
    const tokens = this.localToken.refreshAccessToken(dto.refreshToken, authPayload);
    return tokens;
  }

  async me(auth: AuthPayload): Promise<MeResponseDto> {
    const user = await this.resolveUserFromAuth(auth);
    return {
      user: mapUser(user as UserRow),
      claims: {
        sub: auth.sub,
        role: auth.role,
        companyId: auth.companyId,
        branchId: auth.branchId,
        siteId: auth.siteId,
      },
    };
  }

  private async loginWithCognito(
    dto: LoginRequestDto,
  ): Promise<ApiDataEnvelopeDto<LoginResponseDto>> {
    const username = (dto.email ?? dto.userId ?? '').trim();
    const password = dto.password ?? '';
    if (!username || !password) {
      throw new BadRequestException('email and password are required for Cognito login');
    }

    const tokens = await this.cognito.loginWithPassword(username, password);
    const payload = await this.cognito.verifyAccessToken(tokens.accessToken);

    let user = await this.dao.findEntityBySsoId(payload.sub);
    if (!user) {
      user = await this.dao.findEntityByLoginId(username);
    }

    if (!user) {
      throw new NotFoundException('User not registered in portal database');
    }
    if (!user.is_use || user.account_status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    return wrapData(
      {
        user: mapUser(user as unknown as UserRow),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          idToken: tokens.idToken,
          expiresIn: tokens.expiresIn,
          tokenType: 'Bearer',
        },
        provider: 'aws' as const,
      },
      batchMeta('postgres.user', 'realtime'),
    );
  }

  private async loginWithLocalJwt(
    dto: LoginRequestDto,
  ): Promise<ApiDataEnvelopeDto<LoginResponseDto>> {
    const loginId = resolveLoginId(dto);
    if (!loginId) throw new BadRequestException('userId or email required');

    const user = await this.dao.findEntityByLoginId(loginId);
    if (!user) throw new NotFoundException('user not found');
    if (!user.is_use) throw new UnauthorizedException('Account disabled');
    if (user.account_status !== 'active') {
      throw new UnauthorizedException(`Account status: ${user.account_status}`);
    }

    await this.verifyLocalPassword(user, dto.password);

    const authPayload = this.buildAuthPayload(user);
    const tokens = this.localToken.issueTokens(authPayload);

    return wrapData(
      {
        user: mapUser(user as unknown as UserRow),
        tokens,
        provider: 'local' as const,
      },
      batchMeta('postgres.user', 'realtime'),
    );
  }

  private async verifyLocalPassword(user: UserEntity, password?: string): Promise<void> {
    if (user.password_hash) {
      if (!password) throw new UnauthorizedException('Password required');
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) throw new UnauthorizedException('Invalid credentials');
      return;
    }

    if (!AUTH_CONFIG.allowDemoLogin) {
      throw new UnauthorizedException('Password required (demo login disabled)');
    }

    const demoPassword = password ?? 'demo-password';
    if (demoPassword !== 'demo-password') {
      throw new UnauthorizedException('Invalid demo password (use demo-password)');
    }
  }

  private buildAuthPayload(user: UserEntity): Omit<AuthPayload, 'provider'> {
    return {
      sub: String(user.id),
      code: user.code,
      email: user.email ?? undefined,
      name: user.user_name ?? undefined,
      role: authTypeToRole(user.auth_type),
      siteId: user.scope_site_id ?? undefined,
    };
  }

  private async resolveUserFromAuth(auth: AuthPayload): Promise<UserEntity> {
    if (auth.provider === 'cognito') {
      const bySso = await this.dao.findEntityBySsoId(auth.sub);
      if (bySso) return bySso;
    }
    const id = Number(auth.sub);
    if (!Number.isNaN(id)) {
      const byId = await this.dao.findEntityById(id);
      if (byId) return byId;
    }
    if (auth.email || auth.code) {
      const byLogin = await this.dao.findEntityByLoginId(auth.email ?? auth.code ?? '');
      if (byLogin) return byLogin;
    }
    throw new NotFoundException('User not found');
  }
}
