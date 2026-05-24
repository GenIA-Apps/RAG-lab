import { Test, TestingModule } from '@nestjs/testing';
import { PdfLoaderService } from './pdf-loader.service';

describe('PdfLoaderService', () => {
  let service: PdfLoaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfLoaderService],
    }).compile();

    service = module.get<PdfLoaderService>(PdfLoaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
