import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_CONFIG } from './auth.config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthTokenVerifierService } from './services/auth-token-verifier.service';
import { CognitoAuthService } from './services/cognito-auth.service';
import { LocalTokenService } from './services/local-token.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: AUTH_CONFIG.jwtSecret,
      signOptions: { expiresIn: AUTH_CONFIG.jwtExpiresIn as `${number}h` },
    }),
  ],
  providers: [
    LocalTokenService,
    CognitoAuthService,
    AuthTokenVerifierService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [LocalTokenService, CognitoAuthService, AuthTokenVerifierService, JwtModule],
})
export class AuthModule {}
