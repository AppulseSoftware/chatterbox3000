---
title: Database Schema
description: D1 database tables and Drizzle ORM schema reference.
---

The worker uses Cloudflare D1 (SQLite) with Drizzle ORM. The schema is defined in `worker/src/db/schema.ts`.

## Tables

### emails

| Column                 | Type    | Description                                           |
| ---------------------- | ------- | ----------------------------------------------------- |
| `id`                   | text PK | UUID, auto-generated                                  |
| `message_id`           | text    | Original Message-ID header                            |
| `sender`               | text    | Envelope sender address                               |
| `from_header`          | text    | From header (may include display name)                |
| `to_header`            | text    | To header                                             |
| `subject`              | text    | Subject line                                          |
| `body_preview`         | text    | First 500 chars of body text                          |
| `raw_size`             | integer | Raw message size in bytes                             |
| `spf_pass`             | boolean | Whether SPF passed                                    |
| `dkim_pass`            | boolean | Whether DKIM passed                                   |
| `status`               | text    | `pending`, `approved`, `rejected`, or `forwarded`     |
| `classification`       | text    | `cold_outreach`, `spam`, `newsletter`, `legitimate`, `unknown` |
| `classification_reason`| text    | Human-readable reason for classification              |
| `raw_storage_key`      | text    | R2 key for raw MIME (optional)                        |
| `created_at`           | text    | ISO datetime, defaults to now                         |
| `actioned_at`          | text    | ISO datetime when approved/rejected                   |

### senders

| Column         | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| `address`      | text PK | Email address                        |
| `display_name` | text    | Display name from From header        |
| `status`       | text    | `allowed`, `blocked`, or `unknown`   |
| `email_count`  | integer | Total emails received from sender    |
| `first_seen`   | text    | ISO datetime of first email          |
| `last_seen`    | text    | ISO datetime of most recent email    |
| `notes`        | text    | Optional notes                       |

### settings

| Column  | Type    | Description         |
| ------- | ------- | ------------------- |
| `key`   | text PK | Setting name        |
| `value` | text    | Setting value       |

**Default settings keys:**

- `destination_email` — where approved mail gets forwarded
- `auto_forward_allowed` — `"true"` or `"false"`, auto-forward from allowed senders
- `auto_reject_blocked` — `"true"` or `"false"`, silently drop from blocked senders

## Migrations

Generate a new migration after schema changes:

```bash
cd worker
bun run db:generate
```

Apply migrations:

```bash
# Local
bun run db:migrate:local

# Production
bun run db:migrate:remote
```
