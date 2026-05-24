import { Injectable } from '@nestjs/common';
import { PdfLoaderService } from './pdf-loader/pdf-loader.service';
import { ChunkerService } from './chunker/chunker.service';
import { TextCleanerService } from './text-cleaner/text-cleaner.service';
import { EmbeddingsService } from './embeddings/embeddings.service';
import { QdrantService } from './qdrant/qdrant.service';
import OpenAI from 'openai';
import { CandidateProfileDto } from './dto/candidate-profile.dto';

@Injectable()
export class RagService {

    private readonly openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    constructor(private readonly pdfLoaderService: PdfLoaderService,
        private readonly chunkerService: ChunkerService,
        private readonly textCleaner: TextCleanerService,
        private readonly embeddingsService: EmbeddingsService,
        private readonly qdrantService: QdrantService) { }

    /**
     * Fait une extraction du PDF présente dans le dossier resources.
     * @returns le text du PDF.
     */
    async getCitizenBook() {
        const rawText = await this.pdfLoaderService.loadCitizenBook();
        const cleanText = this.textCleaner.clean(rawText);
        return cleanText;
    }

    /**
     * Fait la récupération des chunks sur une base de taille 1000 avec un overlap de 200, 
     * Après avoir nettoyer le text avec le textCleaner
     * @returns la liste des chunks
     */
    async getChunks() {
        const rawText = await this.pdfLoaderService.loadCitizenBook();
        const cleanText = this.textCleaner.clean(rawText);
        const chunks = this.chunkerService.chunkText(cleanText);
        return chunks;
    }

    async search(query: string) {
        const embedding =
            await this.embeddingsService.embedText(query);

        const results =
            await this.qdrantService.searchSimilarChunks(
                embedding,
            );

        return results.map((result) => ({
            score: result.score,
            text: result.payload?.text,
        }));
    }

    async indexCitizenBook() {
        const rawText = await this.pdfLoaderService.loadCitizenBook();
        const cleanText = this.textCleaner.clean(rawText);
        const chunks = this.chunkerService.chunkText(cleanText);
        const embeddings = await Promise.all(
            chunks.map((chunk) =>
                this.embeddingsService.embedText(chunk),
            ),
        );

        return this.qdrantService.insertChunks(
            chunks,
            embeddings,
        );
    }

    async generateInterviewQuestion(
        dto: CandidateProfileDto,
    ) {
        const searchQuery = `
    naturalisation française
    valeurs de la République
    citoyenneté
    droits et devoirs
    ${dto.birthCountry}
    ${dto.personalContext}
  `;

        const embedding =
            await this.embeddingsService.embedText(
                searchQuery,
            );

        const results =
            await this.qdrantService.searchSimilarChunks(
                embedding,
                3,
            );

        const context = results
            .map((result) => result.payload?.text)
            .join('\n\n');

        const prompt = `
Tu es un agent officiel chargé d’un entretien de naturalisation française.

Tu dois poser UNE question pertinente, réaliste et bienveillante à un candidat.

Le candidat :
- Pays de naissance : ${dto.birthCountry}
- Ville de naissance : ${dto.birthCity}
- Genre : ${dto.gender}

Contexte personnel :
${dto.personalContext}

Contexte officiel du livret du citoyen :
${context}

Règles :
- Pose UNE seule question.
- La question doit être naturelle.
- La question doit être liée aux valeurs de la République, à la citoyenneté ou à l’intégration.
- Adapte légèrement la question au profil du candidat.
- Ne donne pas la réponse.
`;

        const completion =
            await this.openai.chat.completions.create({
                model: 'gpt-4.1-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'Tu es un agent d’entretien de naturalisation française.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            });

        return {
            question:
                completion.choices[0].message.content,
            retrievedChunks: results.map((r) => ({
                score: r.score,
                preview: String(
                    r.payload?.text,
                ).slice(0, 200),
            })),
        };
    }
}
