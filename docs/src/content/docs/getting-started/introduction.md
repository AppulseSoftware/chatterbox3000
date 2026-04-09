---
title: Introduction
description: What Chatterbox3000 is and why you'd use it.
---

Chatterbox3000 is a self-hosted email filtering service that sits between incoming mail and your inbox. It intercepts emails via Cloudflare Email Routing, classifies them using heuristic rules, and either auto-forwards them or holds them for manual review.

## The Problem

If you publish a contact email anywhere — your website, GitHub profile, domain WHOIS — you'll get cold outreach, spam, and newsletters mixed in with legitimate mail. Traditional spam filters miss cold outreach because it's technically not spam.

## The Solution

Chatterbox3000 adds an approval layer:

1. **Known senders** (allowlisted) get forwarded immediately
2. **Blocked senders** get silently dropped
3. **Unknown senders** are held in a queue for you to review

You manage everything from a Chrome Extension side panel — approve, reject, or permanently allow/block senders with one click.

## Architecture Overview

```
Sender → MX → Cloudflare Email Routing → Email Worker
                                            ├── Allowed? → Forward immediately
                                            ├── Blocked? → Drop
                                            └── Unknown? → Classify → Queue for review
                                                              ↓
                                                    Chrome Extension (Side Panel)
                                                    ├── Approve → Forward via send_email
                                                    └── Reject → Archive
```

## Tech Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Email ingress      | Cloudflare Email Routing + Workers |
| API                | Cloudflare Workers (Hono)          |
| Database           | Cloudflare D1 (SQLite)             |
| ORM                | Drizzle ORM                        |
| Real-time updates  | Durable Objects (WebSocket)        |
| Auth               | Shared bearer token                |
| Extension frontend | React + TanStack Router/Query      |
| Extension type     | Chrome Side Panel (Manifest V3)    |
