import { Hono } from "hono";
import { createDb } from "../db/index.ts";
import {
  getEmails,
  getEmailById,
  rejectEmail,
  bulkAction,
  getStats,
  getSettings,
  storeEmail,
  upsertSender,
  allowSender,
  blockSender,
} from "../services/storage.ts";
import { forwardApprovedEmailRows } from "../services/approval-forward.ts";
import { classify } from "../services/classifier.ts";
import type { HonoEnv } from "./router.ts";

export const emailRoutes = new Hono<HonoEnv>();

emailRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const status = c.req.query("status");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const result = await getEmails(db, status, limit, offset);
  return c.json(result);
});

emailRoutes.get("/stats", async (c) => {
  const db = createDb(c.env.DB);
  const stats = await getStats(db);
  return c.json(stats);
});

emailRoutes.get("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const email = await getEmailById(db, c.req.param("id"));
  if (!email) return c.json({ error: "Not found" }, 404);
  return c.json(email);
});

emailRoutes.post("/:id/approve", async (c) => {
  const db = createDb(c.env.DB);
  const email = await getEmailById(db, c.req.param("id"));
  if (!email) return c.json({ error: "Not found" }, 404);

  // Allow sender, approve all their pending emails, forward those rows (not a capped global query)
  const newlyApproved = await allowSender(db, email.sender);
  await forwardApprovedEmailRows(db, c.env, newlyApproved);

  // Notify via Durable Object
  try {
    const hubId = c.env.NOTIFICATION_HUB.idFromName("default");
    const hub = c.env.NOTIFICATION_HUB.get(hubId);
    await hub.fetch(
      new Request("http://internal/notify", {
        method: "POST",
        body: JSON.stringify({ type: "sender_updated", address: email.sender, status: "allowed" }),
      }),
    );
  } catch {}

  return c.json(email);
});

emailRoutes.post("/:id/reject", async (c) => {
  const db = createDb(c.env.DB);
  const email = await rejectEmail(db, c.req.param("id"));
  if (!email) return c.json({ error: "Not found" }, 404);

  // Always block this sender (rejects all their pending emails too)
  await blockSender(db, email.sender);

  try {
    const hubId = c.env.NOTIFICATION_HUB.idFromName("default");
    const hub = c.env.NOTIFICATION_HUB.get(hubId);
    await hub.fetch(
      new Request("http://internal/notify", {
        method: "POST",
        body: JSON.stringify({ type: "email_updated", email }),
      }),
    );
  } catch {}

  return c.json(email);
});

emailRoutes.post("/:id/retry-forward", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const email = await getEmailById(db, id);
  if (!email) return c.json({ error: "Not found" }, 404);
  if (email.status !== "approved") {
    return c.json({ error: "Only emails stuck in approved can be retried" }, 400);
  }

  const settings = await getSettings(db);
  if (!settings.destination_email?.trim()) {
    return c.json({ error: "Set destination email in settings first" }, 400);
  }

  await forwardApprovedEmailRows(db, c.env, [email]);
  const updated = await getEmailById(db, id);
  if (!updated || updated.status !== "forwarded") {
    return c.json(
      {
        error:
          "Forward did not complete. Check SEND_EMAIL binding, routing, and worker logs.",
        email: updated ?? email,
      },
      502,
    );
  }

  try {
    const hubId = c.env.NOTIFICATION_HUB.idFromName("default");
    const hub = c.env.NOTIFICATION_HUB.get(hubId);
    await hub.fetch(
      new Request("http://internal/notify", {
        method: "POST",
        body: JSON.stringify({ type: "email_updated", email: updated }),
      }),
    );
  } catch {}

  return c.json(updated);
});

// Simulate an incoming email for local testing
emailRoutes.post("/test", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json<{
    sender: string;
    from?: string;
    to?: string;
    subject: string;
    bodyPreview?: string;
    headers?: Record<string, string>;
    spfPass?: boolean;
    dkimPass?: boolean;
  }>();

  const sender = body.sender;
  const fromHeader = body.from || sender;
  const toHeader = body.to || "test@localhost";
  const subject = body.subject;
  const bodyPreview = body.bodyPreview || "";
  const spfPass = body.spfPass ?? true;
  const dkimPass = body.dkimPass ?? true;

  const result = classify({
    subject,
    bodyPreview,
    spfPass,
    dkimPass,
    sender,
    headers: body.headers || {},
  });

  await upsertSender(db, sender, null);

  const stored = await storeEmail(db, {
    sender,
    fromHeader,
    toHeader,
    subject,
    bodyPreview,
    spfPass,
    dkimPass,
    status: "pending",
    classification: result.classification,
    classificationReason: result.reason,
  });

  // Notify via Durable Object
  try {
    const hubId = c.env.NOTIFICATION_HUB.idFromName("default");
    const hub = c.env.NOTIFICATION_HUB.get(hubId);
    await hub.fetch(new Request("http://internal/notify", {
      method: "POST",
      body: JSON.stringify({ type: "new_email", email: stored }),
    }));
  } catch {}

  return c.json(stored, 201);
});

emailRoutes.post("/bulk", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json<{ ids: string[]; action: "approve" | "reject" }>();
  const results = await bulkAction(db, body.ids, body.action);
  if (body.action === "approve") {
    await forwardApprovedEmailRows(db, c.env, results);
  }
  return c.json(results);
});
