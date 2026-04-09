---
title: Email Forwarding
description: How Chatterbox3000 forwards approved emails using Cloudflare's native send_email binding.
---

## How It Works

Chatterbox3000 uses Cloudflare's native `send_email` Worker binding to forward approved emails. No external SMTP relay or third-party service is needed.

When you approve an email in the extension:

1. The API updates the email status to `approved`
2. The worker constructs a MIME message and sends it via the `send_email` binding
3. On success, the status is updated to `forwarded`

The forwarded email includes:
- A classification tag in the subject (e.g., `[cold_outreach] Original Subject`)
- The original sender in the body
- The body preview text

### Classification Tags in Subject

Forwarded emails have the classification prepended to the subject line:

- `[cold_outreach] Quick question about your product`
- `[newsletter] Weekly Digest #42`
- `[spam] You've won a prize!`
- `[legitimate] Invoice #1234`
- `[unknown] Hello`

This lets you set up rules in your upstream email provider (Gmail, Outlook, etc.) to automatically sort, label, or filter forwarded emails based on classification.

## Configuration

The `send_email` binding is already configured in `wrangler.toml`:

```toml
[[send_email]]
name = "SEND_EMAIL"
```

No API keys or external accounts are required. The binding uses Cloudflare Email Routing to send the message.

## Requirements

- Your domain must have Cloudflare Email Routing enabled
- The destination email address must be a verified Email Routing destination address in Cloudflare

## Immediate vs. Deferred Forwarding

Chatterbox3000 handles two forwarding paths:

### Immediate (in email handler)

When an email arrives from an **allowed sender** with auto-forward enabled, the worker calls `message.forward(destination)` directly in the email event handler. This is the most efficient path.

### Deferred (on manual approval)

When you approve a queued email from the Chrome extension, the worker uses the `send_email` binding to send a new message to your destination. This works because `send_email` can be called from any Worker handler, unlike `message.forward()` which only works in the email event.

## Customization

The forwarding logic is in `worker/src/services/forwarder.ts`. You can customize the MIME message format, headers, or subject prefix there.
