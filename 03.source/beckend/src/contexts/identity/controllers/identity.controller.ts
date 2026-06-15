/**
 * @file identity.controller.ts
 * @description 인증 REST API. prefix `api/auth`.
 */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../../infrastructure/auth/decorators/public.decorator';
import { CurrentUser } from '../../../infrastructure/auth/decorators/current-user.decorator';
import type { AuthPayload } from '../../../infrastructure/auth/types/auth-payload.types';
import { IdentityService } from '../services/identity.service';
import {
  LoginRequestDto,
  RefreshTokenRequestDto,
} from '../dto/auth.dto';
import type {
  AuthConfigResponseDto,
  LoginResponseDto,
  MeResponseDto,
  AuthTokensDto,
} from '../dto/auth.dto';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import type { UserAccountDto } from '../../service/dto/service.dto';

@Controller('auth')
export class IdentityController {
  constructor(private readonly service: IdentityService) {}

  @Public()
  @Get('config')
  config(): AuthConfigResponseDto {
    return this.service.getAuthConfig();
  }

  @Public()
  @Get('users')
  users(): Promise<ApiDataEnvelopeDto<ItemsDto<UserAccountDto>>> {
    return this.service.listUsers();
  }

  @Public()
  @Post('login')
  login(@Body() body: LoginRequestDto): Promise<ApiDataEnvelopeDto<LoginResponseDto>> {
    return this.service.login(body);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: RefreshTokenRequestDto): Promise<AuthTokensDto> {
    return this.service.refresh(body);
  }

  /** Bearer 토큰 필수 */
  @Get('me')
  me(@CurrentUser() user: AuthPayload): Promise<MeResponseDto> {
    return this.service.me(user);
  }
}
