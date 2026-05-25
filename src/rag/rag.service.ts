import { Injectable } from '@nestjs/common';
import { PdfLoaderService } from './pdf-loader/pdf-loader.service';
import { ChunkerService } from './chunker/chunker.service';
import { TextCleanerService } from './text-cleaner/text-cleaner.service';
import { EmbeddingsService } from './embeddings/embeddings.service';
import { QdrantService } from './qdrant/qdrant.service';
import OpenAI from 'openai';
import { CandidateProfileDto } from './dto/candidate-profile.dto';
import { PromptLoaderService } from './prompt-loader/prompt-loader.service';

@Injectable()
export class RagService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    private readonly pdfLoaderService: PdfLoaderService,
    private readonly chunkerService: ChunkerService,
    private readonly textCleaner: TextCleanerService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly qdrantService: QdrantService,
    private readonly promptLoader: PromptLoaderService
  ) {}

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
    const embedding = await this.embeddingsService.embedText(query);

    const results = await this.qdrantService.searchSimilarChunks(embedding);

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
      chunks.map((chunk) => this.embeddingsService.embedText(chunk)),
    );

    return this.qdrantService.insertChunks(chunks, embeddings);
  }

  async generateQuestionBasedOnTheme(theme : string, numberOfQuestion: Int8Array, profil: CandidateProfileDto) {
    const embedding = await this.embeddingsService.embedText(theme);
    const results = await this.qdrantService.searchSimilarChunks(embedding);
    const context = results.map((result) => result.payload?.text).join('\n\n');

    const prompt = this.promptLoader.loadPrompt('prompt_numbered_base_on_theme.txt', {
      birthCountry: profil.birthCountry,
      birthCity: profil.birthCity,
      gender: profil.gender,
      personalContext: profil.personalContext, 
      context: context,
      questionNumber: `${numberOfQuestion}`
    })

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un agent d’entretien de naturalisation française.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return {
      question: completion.choices[0].message.content,
      retrievedChunks: results.map((r) => ({
        score: r.score,
        preview: String(r.payload?.text).slice(0, 200),
      })),
    };
  }

  async generateInterviewQuestion(dto: CandidateProfileDto) {
    const searchQuery = `
    naturalisation française
    valeurs de la République
    citoyenneté
    droits et devoirs
    ${dto.birthCountry}
    ${dto.personalContext}
  `;

    const embedding = await this.embeddingsService.embedText(searchQuery);

    const results = await this.qdrantService.searchSimilarChunks(embedding, 3);

    const context = results.map((result) => result.payload?.text).join('\n\n');

    const prompt = this.promptLoader.loadPrompt('prompt_agent_random_question.txt', {
      birthCountry: dto.birthCountry,
      birthCity: dto.birthCity,
      gender: dto.gender,
      personalContext: dto.personalContext, 
      context: context
    })

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un agent d’entretien de naturalisation française.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return {
      question: completion.choices[0].message.content?.split('|'),
      retrievedChunks: results.map((r) => ({
        score: r.score,
        preview: String(r.payload?.text).slice(0, 200),
      })),
    };
  }
}
