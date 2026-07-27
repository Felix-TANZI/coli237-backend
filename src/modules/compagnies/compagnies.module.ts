import { Module } from '@nestjs/common';
import { CompagniesController } from './compagnies.controller';
import { CompagniesService } from './compagnies.service';

@Module({
  controllers: [CompagniesController],
  providers: [CompagniesService],
})
export class CompagniesModule {}
