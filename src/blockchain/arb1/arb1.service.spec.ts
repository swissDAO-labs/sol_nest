import { Test, TestingModule } from '@nestjs/testing';
import { Arb1Service } from './arb1.service';

describe('Arb1Service', () => {
  let service: Arb1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Arb1Service],
    }).compile();

    service = module.get<Arb1Service>(Arb1Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
