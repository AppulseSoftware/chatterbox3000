import { createDb } from "./db/index.ts";
import { classify } from "./services/classifier.ts";
import {
  storeEmail,
  upsertSender,
  getSender,
  getSettings,
} from "./services/storage.ts";
import type { Env } from "./index.ts";

export async function handleEmail(
  message: ForwardableEmailMessage,
  env: Env,
): Promise<void> {
  const db = createDb(env.DB);

  const sender = message.from;
  const toHeader = message.to;
  const subject = message.headers.get("subject") || "";
  const messageId = message.headers.get("message-id") || undefined;
  const fromHeader = message.headers.get("from") || sender;
  const rawSize = message.rawSize;

  // Extract body preview from raw message
  const raw = await new Response(message.raw).text();
  const bodyPreview = extractBodyPreview(raw);

  // Check SPF/DKIM from headers
  // Cloudflare may use "authentication-results" or "arc-authentication-results"
  const authResults =
    message.headers.get("authentication-results") ||
    message.headers.get("arc-authentication-results") ||
    "";
  // If no auth header exists, assume pass (don't penalize for missing info)
  const hasAuthResults = authResults.length > 0;
  const spfPass = !hasAuthResults || /spf=pass/i.test(authResults);
  const dkimPass = !hasAuthResults || /dkim=pass/i.test(authResults);

  // Build headers map for classifier
  const headers: Record<string, string> = {};
  message.headers.forEach((value, key) => {
    headers[key] = value;
  });

  console.log(`[email] from=${sender} subject="${subject}" spf=${spfPass} dkim=${dkimPass} auth-results="${authResults.slice(0, 200)}"`);

  const settings = await getSettings(db);
  const destination = settings.destination_email;
  const autoForward = settings.auto_forward_allowed === "true";
  const autoReject = settings.auto_reject_blocked === "true";

  // Upsert sender record
  const displayName = extractDisplayName(fromHeader);
  await upsertSender(db, sender, displayName);

  // Check sender status
  const senderRecord = await getSender(db, sender);

  if (senderRecord?.status === "allowed" && autoForward && destination) {
    // Auto-forward from allowed sender
    await message.forward(destination);
    await storeEmail(db, {
      messageId,
      sender,
      fromHeader,
      toHeader,
      subject,
      bodyPreview,
      rawSize,
      spfPass,
      dkimPass,
      status: "forwarded",
      classification: "legitimate",
      classificationReason: "Allowed sender, auto-forwarded",
    });
    return;
  }

  if (senderRecord?.status === "blocked" && autoReject) {
    // Auto-reject from blocked sender
    await storeEmail(db, {
      messageId,
      sender,
      fromHeader,
      toHeader,
      subject,
      bodyPreview,
      rawSize,
      spfPass,
      dkimPass,
      status: "rejected",
      classification: "spam",
      classificationReason: "Blocked sender, auto-rejected",
    });
    return;
  }

  // Classify unknown/unactioned emails
  const result = classify({
    subject,
    bodyPreview: bodyPreview || "",
    spfPass,
    dkimPass,
    sender,
    headers,
  });

  const stored = await storeEmail(db, {
    messageId,
    sender,
    fromHeader,
    toHeader,
    subject,
    bodyPreview,
    rawSize,
    spfPass,
    dkimPass,
    status: "pending",
    classification: result.classification,
    classificationReason: result.reason,
  });

  // Notify via Durable Object
  try {
    const hubId = env.NOTIFICATION_HUB.idFromName("default");
    const hub = env.NOTIFICATION_HUB.get(hubId);
    await hub.fetch(new Request("http://internal/notify", {
      method: "POST",
      body: JSON.stringify({ type: "new_email", email: stored }),
    }));
  } catch (e) {
    console.error("Failed to notify via WebSocket:", e);
  }
}

function extractBodyPreview(raw: string): string {
  // Simple extraction: find the first text part after headers
  const parts = raw.split(/\r?\n\r?\n/);
  if (parts.length < 2) return "";

  let body = parts.slice(1).join("\n\n");

  // Strip HTML tags if present
  body = body.replace(/<[^>]+>/g, " ");
  // Collapse whitespace
  body = body.replace(/\s+/g, " ").trim();
  // Limit to 500 chars
  return body.slice(0, 500);
}

function extractDisplayName(fromHeader: string): string | null {
  const match = fromHeader.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : null;
}
