---
title: API Reference
description: Complete REST API reference for the Chatterbox3000 worker.
---

All endpoints require an `Authorization: Bearer <token>` header.

Base URL: `https://email-gateway.your-account.workers.dev`

## Emails

### List emails

```
GET /api/emails?status=pending&limit=50&offset=0
```

**Query parameters:**

| Parameter | Type   | Description                                          |
| --------- | ------ | ---------------------------------------------------- |
| `status`  | string | Filter by status: `pending`, `approved`, `rejected`, `forwarded` |
| `limit`   | number | Max results (default: 50)                            |
| `offset`  | number | Pagination offset (default: 0)                       |

### Get email

```
GET /api/emails/:id
```

### Approve email

```
POST /api/emails/:id/approve
```

Approves the email and forwards it to the destination via Cloudflare's `send_email` binding. Returns the updated email object.

### Reject email

```
POST /api/emails/:id/reject
```

### Bulk action

```
POST /api/emails/bulk
```

**Body:**

```json
{
  "ids": ["uuid-1", "uuid-2"],
  "action": "approve" | "reject"
}
```

### Get stats

```
GET /api/emails/stats
```

**Response:**

```json
{
  "total": 150,
  "pending": 5,
  "approved": 80,
  "rejected": 60,
  "forwarded": 75,
  "last24h": 12,
  "last7d": 45,
  "last30d": 150
}
```

## Senders

### List senders

```
GET /api/senders?status=allowed
```

**Query parameters:**

| Parameter | Type   | Description                                  |
| --------- | ------ | -------------------------------------------- |
| `status`  | string | Filter: `allowed`, `blocked`, `unknown`      |

### Allow sender

```
POST /api/senders/:address/allow
```

Allowlists the sender and approves all their pending emails.

:::note
The `:address` parameter must be URL-encoded (e.g., `user%40example.com`).
:::

### Block sender

```
POST /api/senders/:address/block
```

Blocklists the sender and rejects all their pending emails.

### Reset sender

```
DELETE /api/senders/:address
```

Resets the sender status to `unknown`.

## Settings

### Get settings

```
GET /api/settings
```

**Response:**

```json
{
  "destination_email": "you@example.com",
  "auto_forward_allowed": "true",
  "auto_reject_blocked": "true"
}
```

### Update settings

```
PUT /api/settings
```

**Body:** Key-value pairs to upsert.

```json
{
  "destination_email": "new@example.com",
  "auto_forward_allowed": "false"
}
```

## WebSocket

```
GET /ws?token=YOUR_AUTH_TOKEN
```

Upgrades to a WebSocket connection for real-time updates. Messages are JSON:

```json
{ "type": "new_email", "email": { ... } }
{ "type": "email_updated", "email": { ... } }
{ "type": "sender_updated", "address": "...", "status": "allowed" }
```
