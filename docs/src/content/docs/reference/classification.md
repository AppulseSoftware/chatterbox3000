---
title: Email Classification
description: How the heuristic email classifier works.
---

The classifier runs inline in the email worker on every incoming message. It uses pattern matching — no LLM calls, no external API dependencies.

## Classification Labels

| Label            | Description                                    |
| ---------------- | ---------------------------------------------- |
| `spam`           | Failed authentication (SPF + DKIM both failed) |
| `cold_outreach`  | Matches cold email patterns                    |
| `newsletter`     | Has `List-Unsubscribe` header                  |
| `legitimate`     | No suspicious patterns detected                |
| `unknown`        | Freemail sender with vague subject              |

## Rules (Applied in Order)

### 1. Cloudflare spam score → `spam`

Cloudflare adds an `X-Cf-Spamh-Score` header (0–100, higher = more spammy) to emails processed through Email Routing. If the score is **40 or above**, the email is classified as spam. The threshold is configurable via the `CF_SPAM_THRESHOLD` constant in `classifier.ts`.

### 2. Authentication failure → `spam`

If both SPF and DKIM fail, the email is classified as spam.

### 3. Subject pattern matching → `cold_outreach`

The subject is tested against patterns commonly found in cold outreach:

- "quick question"
- "following up"
- "partnership"
- "15 min call"
- "scale your" / "grow your"
- "looking to connect"
- Single first name followed by `?` (e.g., "Eelco?")
- "let's chat" / "let's connect"
- "reaching out"
- "collaboration opportunity"
- "synergy" variants

### 4. List-Unsubscribe header → `newsletter`

Presence of the `List-Unsubscribe` header indicates a mailing list or newsletter.

### 5. Body calendar link patterns → `cold_outreach`

If the body contains calendar scheduling links:
- calendly.com
- cal.com
- hubspot.com/meetings
- "book a time" / "schedule a call"

### 6. Freemail + vague subject → `unknown`

If the sender uses a freemail domain (Gmail, Outlook, Yahoo, etc.) and the subject is generic (e.g., "hi", "hello", "question"), it's marked unknown for manual review.

### 7. Default → `legitimate`

Everything else is considered legitimate.

## Customization

Edit the patterns in `worker/src/services/classifier.ts`. The classifier exports a single `classify()` function that returns `{ classification, reason }`.

## Future: AI Classification

The architecture supports adding an optional Workers AI call for borderline cases. The plan is to use a small model (e.g., Llama 3 8B) with a simple prompt: "Classify this email as cold_outreach, spam, newsletter, or legitimate. Respond with one word."

This would be opt-in per the settings, only triggered for emails classified as `unknown`.
