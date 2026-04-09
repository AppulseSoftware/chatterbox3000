---
title: DNS & Email Setup
description: Configure your domain's DNS records and Cloudflare Email Routing.
---

## MX Records

Point your domain's MX records to Cloudflare Email Routing:

```
MX  yourdomain.com  →  route1.mx.cloudflare.net  (priority 1)
MX  yourdomain.com  →  route2.mx.cloudflare.net  (priority 2)
MX  yourdomain.com  →  route3.mx.cloudflare.net  (priority 3)
```

:::caution
Changing MX records affects all incoming email for your domain. If you're using an existing email provider (e.g., Google Workspace, Proton Mail), read the section on coexistence below.
:::

## Keep Existing Outbound Sending

If you use a provider like Proton Mail or Google Workspace for sending, keep your existing SPF, DKIM, and DMARC records intact:

```
TXT  yourdomain.com              →  v=spf1 include:_spf.protonmail.ch ~all
CNAME protonmail._domainkey...   →  (your existing DKIM record)
TXT  _dmarc.yourdomain.com      →  v=DMARC1; p=none; ...
```

## Cloudflare Email Routing

1. Go to your domain in the Cloudflare dashboard
2. Navigate to **Email** > **Email Routing**
3. Enable Email Routing if not already enabled
4. Under **Routing rules**, create either:
   - A **catch-all** rule → route to your Email Worker
   - Specific address rules (e.g., `contact@yourdomain.com` → Email Worker)

## Verify It Works

Send a test email to your configured address. Check the worker logs:

```bash
cd worker
wrangler tail
```

You should see the email being received, classified, and stored in D1.
