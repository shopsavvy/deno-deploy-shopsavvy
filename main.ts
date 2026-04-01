import { Hono } from 'https://deno.land/x/hono@v4.6.3/mod.ts'
import { cors } from 'https://deno.land/x/hono@v4.6.3/middleware.ts'

const API_BASE = 'https://api.shopsavvy.com/v1'

function getApiKey(): string {
  const key = Deno.env.get('SHOPSAVVY_API_KEY')
  if (!key) throw new Error('SHOPSAVVY_API_KEY environment variable is not set')
  return key
}

async function apiRequest(endpoint: string, apiKey: string): Promise<unknown> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ShopSavvy-Deno-Deploy/1.0.0',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `HTTP ${response.status}`)
  }

  return data
}

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({
    name: 'ShopSavvy Deno Deploy API',
    endpoints: [
      'GET /search?q=<query>',
      'GET /price/<identifier>',
      'GET /deals',
      'GET /history/<identifier>?start=YYYY-MM-DD&end=YYYY-MM-DD',
    ],
  })
})

app.get('/search', async (c) => {
  const query = c.req.query('q')
  if (!query) return c.json({ success: false, error: 'Missing required query parameter: q' }, 400)

  const limit = c.req.query('limit') || '10'
  const offset = c.req.query('offset') || '0'

  const params = new URLSearchParams({ q: query, limit, offset })
  const data = await apiRequest(`/products/search?${params}`, getApiKey())
  return c.json(data)
})

app.get('/price/:id', async (c) => {
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Missing product identifier' }, 400)

  const retailer = c.req.query('retailer')
  const params = new URLSearchParams({ ids: id })
  if (retailer) params.set('retailer', retailer)

  const data = await apiRequest(`/products/offers?${params}`, getApiKey())
  return c.json(data)
})

app.get('/deals', async (c) => {
  const params = new URLSearchParams()
  const sort = c.req.query('sort')
  const limit = c.req.query('limit')
  const offset = c.req.query('offset')
  const category = c.req.query('category')
  const retailer = c.req.query('retailer')

  if (sort) params.set('sort', sort)
  if (limit) params.set('limit', limit)
  if (offset) params.set('offset', offset)
  if (category) params.set('category', category)
  if (retailer) params.set('retailer', retailer)

  const query = params.toString()
  const data = await apiRequest(`/deals${query ? `?${query}` : ''}`, getApiKey())
  return c.json(data)
})

app.get('/history/:id', async (c) => {
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Missing product identifier' }, 400)

  const start = c.req.query('start')
  const end = c.req.query('end')
  if (!start || !end) {
    return c.json({ success: false, error: 'Missing required query parameters: start, end (YYYY-MM-DD)' }, 400)
  }

  const params = new URLSearchParams({ ids: id, start_date: start, end_date: end })
  const data = await apiRequest(`/products/offers/history?${params}`, getApiKey())
  return c.json(data)
})

app.onError((err, c) => {
  return c.json({ success: false, error: err.message }, 500)
})

Deno.serve({ port: 8000 }, app.fetch)
