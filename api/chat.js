import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Vercel Serverless Function for Gemini AI proxy
 * Handles /api/chat requests seamlessly on Vercel.
 */
export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utiliza POST.' });
  }

  const { prompt, contents } = req.body || {};

  if (!prompt && !contents) {
    return res.status(400).json({ error: 'El campo "prompt" o "contents" es requerido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'La variable de entorno GEMINI_API_KEY (o VITE_GEMINI_API_KEY) no está configurada en Vercel.'
    });
  }

  const candidateModels = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest'
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });

        let response;
        if (contents) {
          let parts = contents;
          if (Array.isArray(contents)) {
            parts = contents.map(item => {
              if (item && item.inlineData) {
                return {
                  inlineData: {
                    data: item.inlineData.data,
                    mimeType: item.inlineData.mimeType || 'application/pdf'
                  }
                };
              }
              return item;
            });
          }
          response = await model.generateContent(parts);
        } else {
          response = await model.generateContent(prompt);
        }

        const text = response.response.text();
        if (text) {
          return res.status(200).json({ text });
        }
      } catch (err) {
        console.warn(`[api/chat] Intento ${attempt} con modelo ${modelName} falló:`, err?.message || err);
        lastError = err;
        const msg = err?.message || String(err);
        const isTransient = msg.includes('503') || msg.includes('high demand') || msg.includes('429');
        if (isTransient && attempt < 2) {
          await new Promise(r => setTimeout(r, 850));
          continue;
        }
        break;
      }
    }
  }

  const finalMsg = lastError?.message || '';
  if (finalMsg.includes('503') || finalMsg.includes('high demand')) {
    return res.status(503).json({
      error: 'El servicio de IA de Google está experimentando alta demanda temporal (Error 503). Por favor reintenta en unos momentos.'
    });
  }

  return res.status(500).json({
    error: finalMsg || 'Error al comunicarse con Gemini.'
  });
}
