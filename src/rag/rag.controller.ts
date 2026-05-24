import { Body, Controller, Get, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { Query } from '@nestjs/common';
import { CandidateProfileDto } from './dto/candidate-profile.dto';

@Controller('rag')
export class RagController {

    constructor(private readonly ragService: RagService) { }

    @Get('/health')
    health() {
        return {
            status: 'UP',
            message: 'RAG module is up'
        }
    }

    @Get('/citizen-book')
    async getBaseFileContent() {
        const cleanText = await this.ragService.getCitizenBook();
        return {
            baseText: cleanText
        }
    }

    @Get('/citizen-book/chunks')
    async getChunks() {
        let chunks = await this.ragService.getChunks();
        return {
            baseText: chunks
        }
    }

    @Get('search')
    async search(@Query('query') query: string) {
        return this.ragService.search(query);
    }



    // @Get('index')
    // async index() {
    //     return this.ragService.indexCitizenBook();
    // }

    @Post('interview/question')
    async generateQuestion(
        @Body() dto: CandidateProfileDto,
    ) {
        return this.ragService.generateInterviewQuestion(
            dto,
        );
    }
}
