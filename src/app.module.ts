import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validerEnv } from './config/env.schema';
import { PrismaModule } from './prisma/prisma.module';
import { SecuriteModule } from './securite/securite.module';
import { StockageModule } from './stockage/stockage.module';
import { HealthModule } from './modules/health/health.module';
import { AgentsModule } from './modules/agents/agents.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursiersModule } from './modules/coursiers/coursiers.module';
import { PartenairesModule } from './modules/partenaires/partenaires.module';
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
    StockageModule,
    HealthModule,
    AgentsModule,
    AuthModule,
    CoursiersModule,
    PartenairesModule,
    ExportModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
