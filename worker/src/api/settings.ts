import { Hono } from "hono";
import { createDb } from "../db/index.ts";
import { getSettings, updateSettings } from "../services/storage.ts";
import type { HonoEnv } from "./router.ts";

export const settingsRoutes = new Hono<HonoEnv>();

settingsRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const result = await getSettings(db);
  return c.json(result);
});

settingsRoutes.put("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json<Record<string, string>>();
  await updateSettings(db, body);
  return c.json({ ok: true });
});
