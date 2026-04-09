---
title: Chrome Extension
description: Build and install the Chatterbox3000 Chrome extension.
---

The Chrome extension provides a side panel UI for reviewing and managing emails.

## Build

```bash
cd extension
bun install
bun run build
```

The built extension is output to `extension/dist/`.

## Install in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/dist` folder

## Configure

1. Click the Chatterbox3000 icon in your toolbar to open the side panel
2. Navigate to the **Settings** tab
3. Enter your worker URL (e.g., `https://email-gateway.your-account.workers.dev`)
4. Enter your auth token
5. Click **Save & Connect**

The connection status indicator will show "Connected" when the WebSocket is active.

## Features

### Pending Queue

The default view shows all emails awaiting review. Each card displays:
- Sender name and address
- Subject line
- Body preview
- Classification badge (cold outreach, spam, newsletter, etc.)
- SPF/DKIM status

**Actions per email:**
- **Approve** — forwards the email to your destination address
- **Reject** — archives it as rejected

**Actions per sender:**
- **Always Allow** — approves all pending and future emails from this sender
- **Always Block** — rejects all pending and future emails from this sender

### Badge Count

The extension icon shows a badge with the number of pending emails, updated every 60 seconds.

### Real-Time Updates

New emails appear instantly via WebSocket — no need to refresh.

## Development

For development with hot reload:

```bash
cd extension
bun run dev
```

Then load the `extension/public` directory as an unpacked extension (the dev server serves the side panel HTML).
