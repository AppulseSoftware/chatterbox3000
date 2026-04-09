---
title: Worker Deployment
description: Deploy the Chatterbox3000 worker to Cloudflare.
---

## Create the D1 Database

```bash
cd worker
wrangler d1 create email-gateway
```

Copy the returned `database_id` into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "email-gateway"
database_id = "your-actual-database-id"
```

## Environment Variables

Create a `worker/.dev.vars` file for local development:

```
AUTH_TOKEN=a-strong-random-token
DESTINATION_EMAIL=your@email.com
```

:::tip
Generate a strong token with: `openssl rand -hex 32`
:::

This file is gitignored and loaded automatically by Wrangler during `wrangler dev`.

For production, set secrets via the CLI:

```bash
wrangler secret put AUTH_TOKEN
wrangler secret put DESTINATION_EMAIL
```

## Run Migrations

```bash
# Local D1 (for development)
bun run db:migrate:local

# Remote D1 (production)
bun run db:migrate:remote
```

## Deploy

```bash
bun run deploy
```

This deploys the worker with:
- HTTP API (Hono router with bearer auth)
- Email handler (receives from Cloudflare Email Routing)
- Durable Object (WebSocket hub for real-time updates)

## Seed Default Settings

After deploying, configure the default settings:

```bash
curl -X PUT https://email-gateway.your-account.workers.dev/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destination_email": "you@example.com",
    "auto_forward_allowed": "true",
    "auto_reject_blocked": "true"
  }'
```

## Local Development

```bash
bun run dev
```

This starts a local wrangler dev server with D1 and Durable Objects emulated locally.
