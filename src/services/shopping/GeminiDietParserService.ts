import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DietStructure } from '../../types/shoppingDiet';
import { GEMINI_DIET_SYSTEM_PROMPT } from '../../prompts/geminiDietPrompt';
import { LocalDocumentParserService } from './LocalDocumentParserService';

export class GeminiDietParserService {
  /**
   * Retrieves the Gemini API Key from Vite env or local storage.
   */
  public static getApiKey(): string {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim() !== '') {
      return envKey.trim().replace(/^["']|["']$/g, '');
    }
    const storedKey = localStorage.getItem('bodyflow_gemini_api_key');
    if (storedKey && storedKey.trim() !== '') {
      return storedKey.trim();
    }
    return '';
  }

  /**
   * Backward-compatible alias for parseDietFile.
   */
  public static async parseDietPdf(file: File): Promise<DietStructure> {
    return this.parseDietFile(file);
  }

  /**
   * Parses any Diet document or image (PDF, Word .docx, Image .jpg/.png/.webp, Excel .xlsx, TXT).
   * Extracts text locally for maximum speed, or sends image/scanned document to Gemini Vision.
   */
  public static async parseDietFile(file: File): Promise<DietStructure> {
    const apiKey = this.getApiKey();
    const isImage = LocalDocumentParserService.isImageFile(file);
    const localText = await LocalDocumentParserService.extractTextFromFile(file);
    let lastError: any = null;

    // Supported production models for Google Gemini API (with priority on latest Flash models)
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
    ];

    // If client API key is available, attempt direct GoogleGenerativeAI call
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of candidateModels) {
        try {
          const config: any = {
            responseMimeType: 'application/json',
          };
          if (!modelName.includes('3.6')) {
            config.temperature = 0.1;
          }

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: config,
          });

          let resultText = '';

          if (!isImage && localText && localText.length > 30) {
            // High-speed text prompt with extracted content
            const prompt = `${GEMINI_DIET_SYSTEM_PROMPT}\n\nDOCUMENTO DE DIETA EXTRACTADO (${file.name}):\n${localText}`;
            const result = await model.generateContent(prompt);
            resultText = result.response.text();
          } else {
            // Multimodal prompt for Images or Scanned Documents
            const filePart = await LocalDocumentParserService.fileToBase64(file);
            const prompt = isImage
              ? `${GEMINI_DIET_SYSTEM_PROMPT}\n\nPor favor analiza la imagen adjunta del plan de alimentación / menú / dieta y devuelve la estructura JSON requerida.`
              : `${GEMINI_DIET_SYSTEM_PROMPT}\n\nPor favor analiza el archivo adjunto (${file.name}) de dieta y devuelve la estructura JSON requerida.`;
            
            const result = await model.generateContent([prompt, filePart]);
            resultText = result.response.text();
          }

          if (resultText && resultText.trim() !== '') {
            return this.cleanAndParseJson(resultText);
          }
        } catch (err: any) {
          console.warn(`[GeminiDietParserService] Falló con el modelo ${modelName}:`, err?.message || err);
          lastError = err;
        }
      }
    }

    // Fallback: Call BodyFlow backend proxy /api/chat if running Node server
    try {
      const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
      let promptContent = '';
      let contentsPayload: any = null;

      if (!isImage && localText && localText.length > 30) {
        promptContent = `${GEMINI_DIET_SYSTEM_PROMPT}\n\nDOCUMENTO DE DIETA EXTRACTADO (${file.name}):\n${localText}`;
        contentsPayload = promptContent;
      } else {
        const filePart = await LocalDocumentParserService.fileToBase64(file);
        promptContent = isImage
          ? `${GEMINI_DIET_SYSTEM_PROMPT}\n\nPor favor analiza la imagen adjunta del plan de alimentación / menú / dieta y devuelve la estructura JSON requerida.`
          : `${GEMINI_DIET_SYSTEM_PROMPT}\n\nPor favor analiza el archivo adjunto (${file.name}) de dieta y devuelve la estructura JSON requerida.`;
        contentsPayload = [promptContent, filePart];
      }

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptContent,
          contents: contentsPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          return this.cleanAndParseJson(data.text);
        }
      }
    } catch (backendErr: any) {
      console.warn('[GeminiDietParserService] Backend proxy /api/chat no disponible:', backendErr?.message || backendErr);
      if (!lastError) lastError = backendErr;
    }

    if (!apiKey) {
      throw new Error(
        'No se encontró la clave de API de Gemini (VITE_GEMINI_API_KEY). ' +
        'Por favor agrégala en la configuración con el botón "Configurar Gemini API Key".'
      );
    }

    throw new Error(
      `No se pudo procesar el archivo con Gemini (${lastError?.message || 'Error de conexión'}). ` +
      'Verifica que tu API Key de Gemini sea válida y tenga cuota disponible.'
    );
  }

  /**
   * Sanitizes and parses the JSON returned from Gemini.
   */
  public static cleanAndParseJson(rawText: string): DietStructure {
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);

      if (!parsed.days || !Array.isArray(parsed.days)) {
        throw new Error('El JSON devuelto por Gemini no contiene la lista de días ("days").');
      }

      return {
        diet_name: parsed.diet_name || 'Plan Nutricional Detectado',
        days: parsed.days || [],
        warnings: parsed.warnings || [],
      };
    } catch (error: any) {
      console.error('Error parseando JSON de Gemini:', rawText, error);
      throw new Error(`Error al interpretar la respuesta de Gemini: ${error.message || 'JSON inválido'}`);
    }
  }
}
