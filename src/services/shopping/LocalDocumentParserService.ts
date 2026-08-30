import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { LocalPdfParserService } from './LocalPdfParserService';

export class LocalDocumentParserService {
  /**
   * Determines if a given file is an image based on its MIME type or extension.
   */
  public static isImageFile(file: File): boolean {
    if (file.type && file.type.startsWith('image/')) {
      return true;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'avif', 'heic'].includes(ext);
  }

  /**
   * Extracts text locally from a document (PDF, Word, Excel, CSV, TXT, MD).
   * If the file is an image, returns empty string so that Gemini Vision processes it natively.
   */
  public static async extractTextFromFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // 1. PDF Documents
    if (ext === 'pdf' || file.type === 'application/pdf') {
      return LocalPdfParserService.extractTextFromPdf(file);
    }

    // 2. Word Documents (.docx)
    if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        return mammothResult.value ? mammothResult.value.trim() : '';
      } catch (err) {
        console.warn('[LocalDocumentParserService] Error extrayendo texto con Mammoth de .docx:', err);
        return '';
      }
    }

    // 3. Excel Spreadsheets & CSV (.xlsx, .xls, .csv)
    if (['xlsx', 'xls', 'csv'].includes(ext) || file.type.includes('spreadsheet') || file.type.includes('csv')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let fullText = '';

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv && csv.trim()) {
              fullText += `--- HOJA: ${sheetName} ---\n${csv.trim()}\n\n`;
            }
          }
        }
        return fullText.trim();
      } catch (err) {
        console.warn('[LocalDocumentParserService] Error extrayendo texto con XLSX:', err);
        return '';
      }
    }

    // 4. Plain Text & Markdown (.txt, .md, .text)
    if (['txt', 'md', 'text', 'rtf'].includes(ext) || file.type.startsWith('text/')) {
      try {
        return await file.text();
      } catch (err) {
        console.warn('[LocalDocumentParserService] Error leyendo archivo de texto:', err);
        return '';
      }
    }

    // 5. Images: return empty string (Gemini Vision will process base64)
    if (this.isImageFile(file)) {
      return '';
    }

    return '';
  }

  /**
   * Converts a File to Base64 format for Gemini Multimodal API calls.
   */
  public static async fileToBase64(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        
        let mimeType = file.type;
        if (!mimeType || mimeType === '') {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          if (ext === 'pdf') mimeType = 'application/pdf';
          else if (ext === 'png') mimeType = 'image/png';
          else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
          else if (ext === 'webp') mimeType = 'image/webp';
          else mimeType = 'application/octet-stream';
        }

        resolve({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
