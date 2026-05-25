import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);

  private readonly client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_TOKEN,
    checkCompatibility: false,
  });

  private readonly collectionName = 'citizen_book';

  async onModuleInit() {
    this.logger.log(`QDRANT_URL = ${process.env.QDRANT_URL ?? 'UNDEFINED'}`);
    this.logger.log(
      `QDRANT_TOKEN = ${process.env.QDRANT_TOKEN ? '***set***' : 'UNDEFINED'}`,
    );
    await this.ensureCollection();
  }

  async ensureCollection() {
    this.logger.log(`Connecting to Qdrant...`);
    try {
      const collections = await this.client.getCollections();
      this.logger.log(
        `Connected. Collections found: ${collections.collections.map((c) => c.name).join(', ') || 'none'}`,
      );

      const exists = collections.collections.some(
        (collection) => collection.name === this.collectionName,
      );

      if (!exists) {
        this.logger.log(
          `Collection "${this.collectionName}" not found, creating...`,
        );
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536,
            distance: 'Cosine',
          },
        });
        this.logger.log(
          `Collection "${this.collectionName}" created successfully.`,
        );
      } else {
        this.logger.log(`Collection "${this.collectionName}" already exists.`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Failed to connect to Qdrant: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      throw err;
    }
  }

  async insertChunks(chunks: string[], embeddings: number[][]) {
    const points = chunks.map((chunk, index) => ({
      id: index + 1,
      vector: embeddings[index],
      payload: {
        text: chunk,
      },
    }));

    await this.client.upsert(this.collectionName, {
      wait: true,
      points,
    });

    return {
      inserted: points.length,
    };
  }

  async searchSimilarChunks(embedding: number[], limit = 3) {
    const results = await this.client.search(this.collectionName, {
      vector: embedding,
      limit,
      score_threshold: 0.5,
    });

    return results;
  }
}
