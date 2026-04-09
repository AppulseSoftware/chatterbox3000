---
title: Quick Start
description: Get Chatterbox3000 running in under 10 minutes.
---

## Prerequisites

- A domain on Cloudflare (with Email Routing enabled)
- [Bun](https://bun.sh) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) authenticated (`wrangler login`)

## 1. Clone and install

```bash
git clone https://github.com/your-org/chatterbox3000.git
cd chatterbox3000
bun install
```

## 2. Create D1 database

```bash
cd worker
wrangler d1 create email-gateway
```

Copy the `database_id` from the output into `worker/wrangler.toml`.

## 3. Configure environment

Create a `worker/.dev.vars` file (for local development):

```
AUTH_TOKEN=generate-a-random-secret-here
DESTINATION_EMAIL=your-real@email.com
```

For production, use Wrangler secrets:

```bash
wrangler secret put AUTH_TOKEN
wrangler secret put DESTINATION_EMAIL
```

## 4. Run migrations

```bash
# Local development
bun run db:migrate:local

# Production
bun run db:migrate:remote
```

## 5. Deploy the worker

```bash
bun run deploy
```

## 6. Set up DNS

Point your domain's MX records to Cloudflare Email Routing:

```
MX  yourdomain.com  →  route1.mx.cloudflare.net  (priority 1)
MX  yourdomain.com  →  route2.mx.cloudflare.net  (priority 2)
MX  yourdomain.com  →  route3.mx.cloudflare.net  (priority 3)
```

Then configure a catch-all or specific address route in Cloudflare Email Routing to point to your worker.

## 7. Build and install the Chrome extension

```bash
cd extension
bun run build
```

Then in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/dist` folder

## 8. Configure the extension

1. Click the Chatterbox3000 icon to open the side panel
2. Go to **Settings**
3. Enter your worker URL and auth token
4. Click **Save & Connect**

You're all set! Incoming emails will now flow through the gateway.
