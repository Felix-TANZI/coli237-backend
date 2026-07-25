import { Test, TestingModule } from '@nestjs/testing';
import { PartenairesService } from './partenaires.service';

describe('PartenairesService', () => {
  let service: PartenairesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartenairesService],
    }).compile();

    service = module.get<PartenairesService>(PartenairesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
