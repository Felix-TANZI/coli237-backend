import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validerEnv } from './config/env.schema';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { SecuriteModule } from './securite/securite.module';
import { AgentsModule } from './modules/agents/agents.module';
import { AgentsController } from './modules/agents/agents.controller';
import { AgentsService } from './modules/agents/agents.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { CoursiersModule } from './modules/coursiers/coursiers.module';
import { CoursiersController } from './modules/coursiers/coursiers.controller';
import { CoursiersService } from './modules/coursiers/coursiers.service';
import { StockageModule } from './stockage/stockage.module';
import { PartenairesModule } from './modules/partenaires/partenaires.module';
import { PartenairesController } from './modules/partenaires/partenaires.controller';
import { PartenairesService } from './modules/partenaires/partenaires.service';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validerEnv,
    }),
    ThrottlerModule.forRoot([{ name: 'global', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    SecuriteModule,
    HealthModule,
    AgentsModule,
    AuthModule,
    CoursiersModule,
    StockageModule,
    PartenairesModule,
    ExportModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AgentsService,
    AuthService,
    CoursiersService,
    PartenairesService,
  ],
  controllers: [AgentsController, AuthController, CoursiersController, PartenairesController],
})
export class AppModule {}
