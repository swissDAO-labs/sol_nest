import { Test, TestingModule } from '@nestjs/testing';
import { Arb1Controller } from './arb1.controller';

describe('Arb1Controller', () => {
  let controller: Arb1Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Arb1Controller],
    }).compile();

    controller = module.get<Arb1Controller>(Arb1Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
