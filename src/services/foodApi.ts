/**
 * FatSecret API client — frontend side.
 *
 * All FatSecret credentials and OAuth 1.0a signing live in the backend
 * (server/index.js). This module simply calls our own Express server.
 *
 * Backend endpoints:
 *   GET /api/foods/search?q=<query>[&max=10][&page=0]  → FoodSearchResult[]
 *   GET /api/foods/:id                                  → FoodSearchResult
 *
 * In development, Vite proxies /api/* to http://localhost:3001 so there are
 * no CORS issues and no credentials are ever in the browser bundle.
 */

// ---------------------------------------------------------------------------
// Types — keep the same shape used throughout the app
// ---------------------------------------------------------------------------

export interface FoodSearchResult {
  id: string
  name: string
  description: string
  macros: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
}

// Base URL — empty string means "same origin" (works via Vite proxy in dev
// and via the real backend origin in production if you set VITE_API_URL).
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json() as { error?: string }
      if (body.error) message = body.error
    } catch { /* ignore parse errors */ }
    throw new Error(`[foodApi] ${message}`)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Search foods by name.
 *
 * @param query      Text to search for (e.g. "chicken breast")
 * @param maxResults Number of results per page (default 10)
 * @param page       Zero-based page offset (default 0)
 *
 * @example
 * const results = await searchFoods('oatmeal')
 * console.log(results[0].macros.calories)
 */
export async function searchFoods(
  query: string,
  maxResults = 10,
  page = 0,
): Promise<FoodSearchResult[]> {
  if (!query.trim()) return []

  const qs = new URLSearchParams({
    q:    query,
    max:  String(maxResults),
    page: String(page),
    region: 'MX',
    language: 'es'
  })

  return apiFetch<FoodSearchResult[]>(`api/foods/search?${qs}`)
}

/**
 * Fetch full nutritional detail for a single food by its FatSecret ID.
 *
 * @example
 * const food = await getFoodById('41963')
 * console.log(food.macros.sugar)
 */
export async function getFoodById(id: string): Promise<FoodSearchResult> {
  return apiFetch<FoodSearchResult>(`api/foods/${encodeURIComponent(id)}`)
}
