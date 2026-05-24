import { Injectable } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfLoaderService {

    async loadCitizenBook() : Promise<string> {
        const filePath = path.join(
            process.cwd(), 
            'src', 'resources', 'livret_du_citoyen.pdf'
        );

        const fileBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({
            data: fileBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        return result.text;    
    }
}
