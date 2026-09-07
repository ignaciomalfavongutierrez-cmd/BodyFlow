/**
 * BodyFlow – Proxy Backend & Gemini AI Server
 * Handles FatSecret OAuth 2.0 and Gemini AI Requests.
 */

import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config() // also load root .env if present

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID || process.env.FATSECRET_CONSUMER_KEY
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET || process.env.FATSECRET_CONSUMER_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('[server] Warning: FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET are not set in server/.env. FatSecret food search will be unavailable until set.')
}

const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api'
const FATSECRET_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token'

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'] 

const app = express()
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin '${origin}' not allowed`))
  },
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// ---------------------------------------------------------------------------
// OAuth 2.0 - Token Management
// ---------------------------------------------------------------------------

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Las credenciales de FatSecret no están configuradas en el servidor.')
  }

  // Reutilizar el token si aún no expira
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Generar Basic Auth Header
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await fetch(FATSECRET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=basic'
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`OAuth Token Error: ${data.error}`);
  }

  accessToken = data.access_token;
  // Guardamos la expiración con 60 segundos de margen de seguridad
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return accessToken;
}

/**
 * Llama a FatSecret enviando el Bearer Token en los headers.
 */
async function callFatSecret(apiParams) {
  const token = await getAccessToken();

  const body = new URLSearchParams({
    format: 'json',
    language: 'es',
    region: 'MX',
    ...apiParams,
  }).toString();

  const res = await fetch(FATSECRET_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body,
  });

  const json = await res.json();

  if (json.error) {
    const err = new Error(`FatSecret error ${json.error.code}: ${json.error.message}`);
    err.status = 502;
    throw err;
  }

  return json;
}

// ---------------------------------------------------------------------------
// Mexican Foods Cache & Direct FatSecret Mexico Web Scraper
// ---------------------------------------------------------------------------

const mexicanFoodsCache = new Map();

function decodeHtmlEntities(str = '') {
  return str
    .replace(/&#241;/gi, 'ñ')
    .replace(/&#209;/gi, 'Ñ')
    .replace(/&#225;/gi, 'á')
    .replace(/&#193;/gi, 'Á')
    .replace(/&#233;/gi, 'é')
    .replace(/&#201;/gi, 'É')
    .replace(/&#237;/gi, 'í')
    .replace(/&#205;/gi, 'Í')
    .replace(/&#243;/gi, 'ó')
    .replace(/&#211;/gi, 'Ó')
    .replace(/&#250;/gi, 'ú')
    .replace(/&#218;/gi, 'Ú')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim();
}

/**
 * Consulta la base de datos oficial y localizada de FatSecret México (fatsecret.com.mx)
 * Permite encontrar marcas mexicanas reales (La Costeña, Bimbo, Saníssimo, Lala, etc.)
 * que la API básica de FatSecret restringe al catálogo de EE. UU.
 */
async function searchFatSecretMexicoWeb(query) {
  const cleanQ = encodeURIComponent(query.trim());
  const url = `https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/search?q=${cleanQ}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-MX,es;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      console.warn('fatsecret.com.mx returned status', res.status);
      return [];
    }

    const html = await res.text();
    const results = [];

    const rowRegex = /<td[^>]*class="borderBottom"[^>]*>([\s\S]*?)<\/td>/g;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      const cellHtml = match[1];

      // Food name & link
      const nameMatch = cellHtml.match(/<a class="prominent" href="([^"]+)">([^<]+)<\/a>/);
      if (!nameMatch) continue;

      const relativeUrl = nameMatch[1];
      const foodName = decodeHtmlEntities(nameMatch[2]);

      // Brand name (if present)
      const brandMatch = cellHtml.match(/<a class="brand"[^>]*>\(([^<]+)\)<\/a>/);
      const brand = brandMatch ? decodeHtmlEntities(brandMatch[1]) : '';

      // Nutrition smallText
      const detailMatch = cellHtml.match(/<div class="smallText[^"]*">([\s\S]*?)<\/div>/);
      let desc = '';
      let calories = 0;
      let fat = 0;
      let carbs = 0;
      let protein = 0;

      if (detailMatch) {
        const rawText = decodeHtmlEntities(detailMatch[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

        // Example: "por 1 porción (50g) - Calorías: 33kcal | Grasa: 0,50g | Carbh: 6,00g | Prot: 1,00g"
        const parts = rawText.split(' - ');
        desc = parts[0]?.replace(/^por\s+/i, '').trim() || '1 porción';

        const calMatch = rawText.match(/Calor[íi]as:\s*([\d,.]+)\s*kcal/i);
        const fatMatch = rawText.match(/Grasa:\s*([\d,.]+)\s*g/i);
        const carbMatch = rawText.match(/Carbh?:\s*([\d,.]+)\s*g/i);
        const protMatch = rawText.match(/Prot:\s*([\d,.]+)\s*g/i);

        const parseNum = (val) => val ? parseFloat(val.replace(',', '.')) : 0;
        calories = calMatch ? Math.round(parseNum(calMatch[1])) : 0;
        fat = fatMatch ? parseNum(fatMatch[1]) : 0;
        carbs = carbMatch ? parseNum(carbMatch[1]) : 0;
        protein = protMatch ? parseNum(protMatch[1]) : 0;
      }

      // Generate unique ID from URL
      const cleanPath = relativeUrl.replace(/^\/calor%C3%ADas-nutrici%C3%B3n\//i, '').replace(/^\/calorías-nutrición\//i, '').replace(/\/$/, '');
      const pathParts = cleanPath.split('/').filter(Boolean);
      const id = 'fsmx_' + pathParts.map(p => decodeURIComponent(p)).join('_');

      const fullName = brand && !foodName.toLowerCase().includes(brand.toLowerCase())
        ? `${foodName} (${brand})`
        : foodName;

      const foodItem = {
        id,
        name: fullName,
        description: desc,
        brand: brand || undefined,
        url: `https://www.fatsecret.com.mx${relativeUrl}`,
        fuente: 'fatsecret',
        macros: {
          calories,
          protein,
          carbs,
          fat,
          sugar: 0
        }
      };

      mexicanFoodsCache.set(id, foodItem);
      results.push(foodItem);
    }

    return results;
  } catch (err) {
    console.error('Error in searchFatSecretMexicoWeb:', err.message);
    return [];
  }
}

async function getFoodByMexicoId(id) {
  const parts = id.replace(/^fsmx_/, '').split('_');
  const path = parts.map(p => encodeURIComponent(p)).join('/');
  const url = `https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-MX,es;q=0.9'
      }
    });

    if (!res.ok) return null;

    const html = await res.text();
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const name = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : parts[1] || 'Alimento';

    // Extract macros
    const calsMatch = html.match(/<div class="factTitle">Cals<\/div>\s*<div class="factValue">([\d,.]+)<\/div>/i);
    const fatMatch = html.match(/<div class="factTitle">Grasa<\/div>\s*<div class="factValue">([\d,.]+)g?<\/div>/i);
    const carbMatch = html.match(/<div class="factTitle">Carbh<\/div>\s*<div class="factValue">([\d,.]+)g?<\/div>/i);
    const protMatch = html.match(/<div class="factTitle">Prot<\/div>\s*<div class="factValue">([\d,.]+)g?<\/div>/i);
    const portionMatch = html.match(/Hay\s+[\d,.]+\s+calor[íi]as\s+en\s+([^.<]+)\./i);

    const parseNum = (m) => m ? parseFloat(m[1].replace(',', '.')) : 0;

    return {
      id,
      name,
      description: portionMatch ? decodeHtmlEntities(portionMatch[1].trim()) : (parts[2] || '1 porción'),
      fuente: 'fatsecret',
      macros: {
        calories: Math.round(parseNum(calsMatch)),
        fat: parseNum(fatMatch),
        carbs: parseNum(carbMatch),
        protein: parseNum(protMatch),
        sugar: 0
      }
    };
  } catch (err) {
    console.warn(`[getFoodByMexicoId] Error fetching ${id}:`, err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function parseMacros(description = '') {
  const extract = pattern => {
    const m = description.match(new RegExp(`(?:${pattern})\\s*:\\s*([\\d.]+)`, 'i'))
    return m ? parseFloat(m[1]) : 0
  }
  return {
    calories: extract('Calories|Calor[íi]as'),
    fat: extract('Fat|Grasa'),
    carbs: extract('Carbs|Carbohydrate|Carbohidratos'),
    protein: extract('Protein|Prote[íi]na'),
    sugar: 0,
  }
}

function translateServingDescription(desc = '') {
  let clean = (desc.split(' - ')[0] ?? '')
    .replace(/^Per\s+/i, '')
    .replace(/^Por\s+/i, '')
    .trim();

  return clean
    .replace(/\b1\s*cup\b/gi, '1 taza (240ml)')
    .replace(/\b1\/2\s*cup\b/gi, '1/2 taza (120ml)')
    .replace(/\b1\/4\s*cup\b/gi, '1/4 taza (60ml)')
    .replace(/\b1\s*tbsp\b|\b1\s*tablespoon\b/gi, '1 cucharada (15ml)')
    .replace(/\b1\s*tsp\b|\b1\s*teaspoon\b/gi, '1 cucharadita (5ml)')
    .replace(/\b1\s*slice\b/gi, '1 rebanada')
    .replace(/\b1\s*item\b|\b1\s*piece\b/gi, '1 pieza')
    .replace(/\b1\s*oz\b/gi, '28 g (1 oz)')
    .replace(/\b1\s*fl\s*oz\b/gi, '30 ml')
    .replace(/\b1\s*can\b/gi, '1 lata')
    .replace(/\b1\s*scoop\b/gi, '1 scoop (30g)')
    .replace(/\b1\s*serving\b/gi, '1 porción');
}

function normaliseItem(item) {
  const brand = item.brand_name?.trim() || '';
  const baseName = item.food_name || '';
  const displayName = brand && !baseName.toLowerCase().includes(brand.toLowerCase())
    ? `${baseName} (${brand})`
    : baseName;

  return {
    id: String(item.food_id),
    name: displayName,
    brand: brand || undefined,
    description: translateServingDescription(item.food_description),
    fuente: 'fatsecret',
    macros: parseMacros(item.food_description),
  }
}

function pickFirstServing(raw) {
  if (!raw) return null
  return Array.isArray(raw) ? raw[0] : raw
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get('/api/foods/search', async (req, res) => {
  const q = (req.query.q ?? '').trim()
  const max = Math.min(parseInt(req.query.max ?? '15', 10), 50)
  const page = Math.max(parseInt(req.query.page ?? '0', 10), 0)

  if (!q) return res.json([])

  try {
    // 1. Prioritize real Mexican database & brands from fatsecret.com.mx
    // 2. Concurrently query official FatSecret REST API as complement
    const [mxResults, apiResults] = await Promise.all([
      searchFatSecretMexicoWeb(q).catch(err => {
        console.warn('[/api/foods/search] Mexican web search error:', err.message);
        return [];
      }),
      callFatSecret({
        method: 'foods.search',
        search_expression: q,
        max_results: String(max),
        page_number: String(page),
        format: 'json',
      }).then(data => {
        const foods = data.foods?.food;
        if (!foods) return [];
        const items = Array.isArray(foods) ? foods : [foods];
        return items.map(normaliseItem);
      }).catch(err => {
        console.warn('[/api/foods/search] FatSecret API fallback error:', err.message);
        return [];
      })
    ]);

    // Deduplicate items, preserving Mexican brand matches at the top
    const combined = [];
    const seen = new Set();

    for (const item of [...mxResults, ...apiResults]) {
      const key = item.name.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, '');
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    return res.json(combined.slice(0, max));
  } catch (err) {
    console.error('[/api/foods/search]', err.message)
    return res.status(err.status ?? 500).json({ error: err.message })
  }
})

app.get('/', async (_req, res) => {
  res.json({ message: 'Welcome to the BodyFlow API' })
})

app.get('/api/foods/:id', async (req, res) => {
  const { id } = req.params

  // Handle Mexican web scraped food
  if (id.startsWith('fsmx_') || mexicanFoodsCache.has(id)) {
    const cached = mexicanFoodsCache.get(id);
    if (cached) {
      return res.json(cached);
    }

    try {
      const fetched = await getFoodByMexicoId(id);
      if (fetched) {
        mexicanFoodsCache.set(id, fetched);
        return res.json(fetched);
      }
    } catch (err) {
      console.warn(`[/api/foods/:id] Error resolving Mexican item ${id}:`, err.message);
    }
  }

  // Fallback to FatSecret REST API
  try {
    const data = await callFatSecret({ method: 'food.get.v4', food_id: id, format: 'json' })

    if (!data.food) return res.status(404).json({ error: 'Food not found' })

    const food = data.food
    const serving = pickFirstServing(food.servings?.serving)

    if (!serving) {
      return res.status(404).json({ error: 'Nutrition info not found' })
    }

    const brand = food.brand_name?.trim() || '';
    const baseName = food.food_name || '';
    const displayName = brand && !baseName.toLowerCase().includes(brand.toLowerCase())
      ? `${baseName} (${brand})`
      : baseName;

    return res.json({
      id: food.food_id,
      name: displayName,
      brand: brand || undefined,
      description: serving.serving_description,
      fuente: 'fatsecret',
      macros: {
        calories: parseFloat(serving.calories ?? '0'),
        protein: parseFloat(serving.protein ?? '0'),
        carbs: parseFloat(serving.carbohydrate ?? '0'),
        fat: parseFloat(serving.fat ?? '0'),
        sugar: parseFloat(serving.sugar ?? '0'),
      },
    })
  } catch (err) {
    console.error('[/api/foods/:id]', err.message)
    return res.status(err.status ?? 500).json({ error: err.message })
  }
})

app.post('/api/chat', async (req, res) => {
  const { prompt, contents } = req.body

  if (!prompt && !contents) {
    return res.status(400).json({ error: 'El campo "prompt" o "contents" es requerido.' })
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!geminiKey) {
    console.error('[/api/chat] GEMINI_API_KEY no está configurada en .env del servidor')
    return res.status(500).json({ error: 'La API Key de Gemini (GEMINI_API_KEY) no está configurada en el servidor.' })
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey })
  const candidateModels = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest'
  ]

  let lastError = null
  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents || prompt,
        })

        const text = response.text || ''
        if (text) {
          return res.json({ text })
        }
      } catch (err) {
        lastError = err
        const msg = err?.message || String(err)
        console.warn(`[/api/chat] Intento ${attempt} con modelo ${modelName} falló:`, msg)
        const isTransient = msg.includes('503') || msg.includes('high demand') || msg.includes('429')
        if (isTransient && attempt < 2) {
          await new Promise(r => setTimeout(r, 850))
          continue
        }
        break
      }
    }
  }

  const finalMsg = lastError?.message || ''
  if (finalMsg.includes('503') || finalMsg.includes('high demand')) {
    return res.status(503).json({ error: 'El servicio de IA de Google está experimentando alta demanda temporal (Error 503). Por favor reintenta en unos momentos.' })
  }
  return res.status(500).json({ error: finalMsg || 'Error interno al comunicarse con Gemini.' })
})

// ---------------------------------------------------------------------------
// Utilities Module Routes
// ---------------------------------------------------------------------------

app.get('/api/utilities/info', (_req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    modules: [
      { id: 'shopping-list', name: 'Creador de Lista de Compras', available: true },
      { id: 'diet-generator', name: 'Generador de Dietas', available: false },
      { id: 'patient-stats', name: 'Estadísticas de Pacientes', available: false }
    ]
  })
})

app.get('/utilities', (_req, res) => {
  res.json({
    name: 'BodyFlow Utilities Hub',
    description: 'Panel de herramientas para profesionales de la nutrición',
    modules: ['pacientes', 'home', 'utilities']
  })
})

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[server] BodyFlow proxy running on http://localhost:${PORT}`)
})

