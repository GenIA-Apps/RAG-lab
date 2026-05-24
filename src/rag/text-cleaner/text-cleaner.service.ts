import { Injectable } from '@nestjs/common';

@Injectable()
export class TextCleanerService {
clean(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/\u00a0/g, ' ')
    // supprime les longues suites de points
    .replace(/\.{3,}/g, ' ')
    // supprime les suites de tirets/underscores
    .replace(/[-_]{3,}/g, ' ')
    // mots coupés par retour ligne
    .replace(/-\s*\n\s*/g, '')
    // retours ligne -> espace
    .replace(/\s*\n\s*/g, ' ')
    // espaces multiples
    .replace(/\s+/g, ' ')
    
    .trim();
    }
}