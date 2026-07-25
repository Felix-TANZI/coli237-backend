import { Test, TestingModule } from '@nestjs/testing';
import { CoursiersController } from './coursiers.controller';

describe('CoursiersController', () => {
  let controller: CoursiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursiersController],
    }).compile();

    controller = module.get<CoursiersController>(CoursiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
