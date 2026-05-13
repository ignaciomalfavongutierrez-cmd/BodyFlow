/**
 * BodyFlow – FatSecret Proxy Backend (Migrado a OAuth 2.0)
 * * Ahora usa Client Credentials Grant (OAuth 2.0) en lugar de 
 * las complejas firmas HMAC-SHA1 de OAuth 1.0a.
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3002

// Usamos preferentemente CLIENT_ID, pero dejamos CONSUMER_KEY por compatibilidad
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID || process.env.FATSECRET_CONSUMER_KEY
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET || process.env.FATSECRET_CONSUMER_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('[server] FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set in .env')
  process.exit(1)
}

const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api'
const FATSECRET_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token'

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'] // Agregué el 5174 basado en tu log

const app = express()
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin '${origin}' not allowed`))
  },
}))
app.use(express.json())

// ---------------------------------------------------------------------------
// OAuth 2.0 - Token Management
// ---------------------------------------------------------------------------

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
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

  // Convertimos los parámetros a formato x-www-form-urlencoded
  const body = new URLSearchParams(apiParams).toString();

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
// Parsing helpers
// ---------------------------------------------------------------------------

function parseMacros(description = '') {
  const extract = label => {
    const m = description.match(new RegExp(`${label}:\\s*([\\d.]+)`))
    return m ? parseFloat(m[1]) : 0
  }
  return {
    calories: extract('Calories'),
    fat: extract('Fat'),
    carbs: extract('Carbs'),
    protein: extract('Protein'),
    sugar: 0,
  }
}

function normaliseItem(item) {
  return {
    id: item.food_id,
    name: item.food_name,
    description: item.food_description?.split(' - ')[0] ?? '',
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
  const max = String(Math.min(parseInt(req.query.max ?? '10', 10), 50))
  const page = String(Math.max(parseInt(req.query.page ?? '0', 10), 0))

  if (!q) return res.json([])

  try {
    const data = await callFatSecret({
      method: 'foods.search', // Mantenemos v2/v3 para obtener la descripción corta
      search_expression: q,
      max_results: max,
      page_number: page,
      format: 'json',
    })

    const foods = data.foods?.food
    if (!foods) return res.json([])

    const items = Array.isArray(foods) ? foods : [foods]
    return res.json(items.map(normaliseItem))
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

  try {
    const data = await callFatSecret({ method: 'food.get.v4', food_id: id, format: 'json' })

    if (!data.food) return res.status(404).json({ error: 'Food not found' })

    const food = data.food
    const serving = pickFirstServing(food.servings?.serving)

    if (!serving) {
      return res.status(404).json({ error: 'Nutrition info not found' })
    }

    return res.json({
      id: food.food_id,
      name: food.food_name,
      description: serving.serving_description,
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

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[server] BodyFlow proxy running on http://localhost:${PORT}`)
})