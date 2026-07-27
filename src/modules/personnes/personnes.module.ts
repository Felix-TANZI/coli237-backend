import { Module } from '@nestjs/common';
import { PersonnesController } from './personnes.controller';
import { PersonnesService } from './personnes.service';

@Module({
  controllers: [PersonnesController],
  providers: [PersonnesService],
})
export class PersonnesModule {}
