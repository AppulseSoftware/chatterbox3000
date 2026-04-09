import { getLocalSettings } from "./storage.ts";

type MessageHandler = (data: any) => void;

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<MessageHandler>();

export function subscribe(handler: MessageHandler) {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}

export async function connect() {
  if (ws?.readyState === WebSocket.OPEN) return;

  const { apiUrl, authToken } = await getLocalSettings();
  if (!apiUrl || !authToken) return;

  const wsUrl = apiUrl
    .replace(/^http/, "ws")
    .replace(/\/$/, "");

  try {
    ws = new WebSocket(`${wsUrl}/ws?token=${authToken}`);

    ws.onopen = () => {
      console.log("[WS] Connected");
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        for (const handler of listeners) {
          handler(data);
        }
      } catch {}
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected, reconnecting in 5s...");
      ws = null;
      reconnectTimer = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch {
    reconnectTimer = setTimeout(connect, 5000);
  }
}

export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  ws?.close();
  ws = null;
}

export function isConnected() {
  return ws?.readyState === WebSocket.OPEN;
}
