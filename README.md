# Deno Deploy + ShopSavvy

A Deno Deploy template for product search and price comparison APIs using the [ShopSavvy Data API](https://shopsavvy.com/data) with the Hono router.

## Setup

1. Set your API key:

```bash
export SHOPSAVVY_API_KEY=ss_live_your_key_here
# Get a key at shopsavvy.com/data
```

2. Run locally:

```bash
deno run --allow-net --allow-env main.ts
```

3. Deploy to Deno Deploy:

```bash
deployctl deploy --project=your-project main.ts
```

Set `SHOPSAVVY_API_KEY` in your Deno Deploy project settings.

## Endpoints

### `GET /search?q=airpods`

Search for products by keyword.

```bash
curl http://localhost:8000/search?q=airpods
```

### `GET /price/:id`

Get current offers for a product by barcode, ASIN, or ShopSavvy ID.

```bash
curl http://localhost:8000/price/B0D1XD1ZV3
```

### `GET /deals`

Browse current shopping deals with optional filters.

```bash
curl "http://localhost:8000/deals?sort=hot&limit=10"
```

### `GET /history/:id?start=2024-01-01&end=2024-06-01`

Get price history for a product over a date range.

```bash
curl "http://localhost:8000/history/B0D1XD1ZV3?start=2024-01-01&end=2024-06-01"
```

## License

MIT
