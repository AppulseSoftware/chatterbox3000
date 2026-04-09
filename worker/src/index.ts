import { api } from "./api/router.ts";
import { handleEmail } from "./email-handler.ts";

export { NotificationHub } from "./durable-objects/notification.ts";

export interface Env {
  DB: D1Database;
  NOTIFICATION_HUB: DurableObjectNamespace;
  SEND_EMAIL: SendEmail;
  RAW_EMAILS?: R2Bucket;
  AUTH_TOKEN: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    await handleEmail(message, env);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade for real-time notifications
    if (url.pathname === "/ws") {
      // Auth check for WebSocket
      const token =
        url.searchParams.get("token") ||
        request.headers.get("Authorization")?.replace("Bearer ", "");
      if (!token || token !== env.AUTH_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
      }

      const hubId = env.NOTIFICATION_HUB.idFromName("default");
      const hub = env.NOTIFICATION_HUB.get(hubId);
      return hub.fetch(request);
    }

    return api.fetch(request, env, ctx);
  },
};
