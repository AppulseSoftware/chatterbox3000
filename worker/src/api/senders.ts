import { Hono } from "hono";
import { createDb } from "../db/index.ts";
import {
  getSenders,
  allowSender,
  blockSender,
  resetSender,
} from "../services/storage.ts";
import type { HonoEnv } from "./router.ts";

export const senderRoutes = new Hono<HonoEnv>();

senderRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const status = c.req.query("status");
  const result = await getSenders(db, status);
  return c.json(result);
});

senderRoutes.post("/:address/allow", async (c) => {
  const db = createDb(c.env.DB);
  const address = decodeURIComponent(c.req.param("address"));
  await allowSender(db, address);

  try {
    const hubId = c.env.NOTIFICATION_HUB.idFromName("default");
    const hub = c.env.NOTIFICATION_HUB.get(hubId);
    await hub.fetch(
      new Request("http://internal/notify", {
        method: "POST",
        body: JSON.stringify({ type: "sender_updated", address, status: "allowed" }),
      }),
    );
  } catch {}

  return c.json({ ok: true });
});

senderRoutes.post("/:address/block", async (c) => {
  const db = createDb(c.env.DB);
  const address = decodeURIComponent(c.req.param("address"));
  await blockSender(db, address);

  try {
    const hubId = c.env.NOTIFICATION_HUB.idFromName("default");
    const hub = c.env.NOTIFICATION_HUB.get(hubId);
    await hub.fetch(
      new Request("http://internal/notify", {
        method: "POST",
        body: JSON.stringify({ type: "sender_updated", address, status: "blocked" }),
      }),
    );
  } catch {}

  return c.json({ ok: true });
});

senderRoutes.delete("/:address", async (c) => {
  const db = createDb(c.env.DB);
  const address = decodeURIComponent(c.req.param("address"));
  await resetSender(db, address);
  return c.json({ ok: true });
});
