import { CandidateProfileDto } from "../dto/candidate-profile.dto";

export class ThemeRequest {
    constructor(
        readonly themeExpected: string,
        readonly numberOfQuestions: Int8Array,
        readonly candidatProfile: CandidateProfileDto
    ) {}
}