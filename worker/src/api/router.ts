import { Hono } from "hono";
import { cors } from "hono/cors";
import { emailRoutes } from "./emails.ts";
import { senderRoutes } from "./senders.ts";
import { settingsRoutes } from "./settings.ts";
import type { Env } from "../index.ts";

export type HonoEnv = {
  Bindings: Env;
};

const api = new Hono<HonoEnv>();

api.use("*", cors());

// Auth middleware
api.use("/api/*", async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token || token !== c.env.AUTH_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

api.route("/api/emails", emailRoutes);
api.route("/api/senders", senderRoutes);
api.route("/api/settings", settingsRoutes);

export { api };
