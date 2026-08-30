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

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
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
    return res.status(200).json({ text });
  } catch (err) {
    console.error('[api/chat] Error procesando solicitud con Gemini gemini-3.6-flash:', err?.message || err);
    return res.status(500).json({
      error: err?.message || 'Error al comunicarse con Gemini.'
    });
  }
}
