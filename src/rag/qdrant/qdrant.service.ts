import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
    private readonly client = new QdrantClient({
        url: 'http://localhost:6333',
    });

    private readonly collectionName = 'citizen_book';

    async onModuleInit() {
        await this.ensureCollection();
    }

    async ensureCollection() {
        const collections = await this.client.getCollections();

        const exists = collections.collections.some(
            (collection) => collection.name === this.collectionName,
        );

        if (!exists) {
            await this.client.createCollection(this.collectionName, {
                vectors: {
                    size: 1536,
                    distance: 'Cosine',
                },
            });
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

    async searchSimilarChunks(
        embedding: number[],
        limit = 3,
    ) {
        const results = await this.client.search(
            this.collectionName,
            {
                vector: embedding,
                limit,
            },
        );

        return results;
    }
}