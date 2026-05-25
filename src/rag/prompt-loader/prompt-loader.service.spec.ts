import { Test, TestingModule } from '@nestjs/testing';
import { PromptLoaderService } from './prompt-loader.service';

describe('PromptLoaderService', () => {
  let service: PromptLoaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptLoaderService],
    }).compile();

    service = module.get<PromptLoaderService>(PromptLoaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
