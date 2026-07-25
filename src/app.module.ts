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
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, AgentsService],
  controllers: [AgentsController],
})
export class AppModule {}
