import { Test, TestingModule } from '@nestjs/testing';
import { PartenairesController } from './partenaires.controller';

describe('PartenairesController', () => {
  let controller: PartenairesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartenairesController],
    }).compile();

    controller = module.get<PartenairesController>(PartenairesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
