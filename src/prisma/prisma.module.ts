import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global : PrismaService devient disponible partout sans reimporter.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
