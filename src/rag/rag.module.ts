import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { PdfLoaderService } from './pdf-loader/pdf-loader.service';
import { ChunkerService } from './chunker/chunker.service';
import { EmbeddingsService } from './embeddings/embeddings.service';
import { TextCleanerService } from './text-cleaner/text-cleaner.service';
import { QdrantService } from './qdrant/qdrant.service';

@Module({
  controllers: [RagController],
  providers: [RagService, PdfLoaderService, ChunkerService, EmbeddingsService, TextCleanerService, QdrantService]
})
export class RagModule {
  
}
