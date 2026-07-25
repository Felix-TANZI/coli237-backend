import { Test, TestingModule } from '@nestjs/testing';
import { CoursiersService } from './coursiers.service';

describe('CoursiersService', () => {
  let service: CoursiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursiersService],
    }).compile();

    service = module.get<CoursiersService>(CoursiersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
