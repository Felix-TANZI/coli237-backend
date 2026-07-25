import { Module } from '@nestjs/common';
import { CoursiersController } from './coursiers.controller';
import { CoursiersService } from './coursiers.service';

@Module({
  controllers: [CoursiersController],
  providers: [CoursiersService],
})
export class CoursiersModule {}
