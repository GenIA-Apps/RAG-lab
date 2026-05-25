import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PromptLoaderService {
  loadPrompt(fileName: string, variables: Record<string, string>): string {
    const filePath = path.join(
      process.cwd(),
      'src',
      'resources',
      'prompts',
      fileName,
    );

    let prompt = fs.readFileSync(filePath, 'utf-8');

    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replaceAll(`{{${key}}}`, value);
    }

    return prompt;
  }
}
