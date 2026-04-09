import React from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider, createHashHistory } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen.ts";
import { connect, subscribe } from "./lib/ws.ts";
import "./styles/global.css";

// Use hash history for Chrome extension compatibility
const hashHistory = createHashHistory();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

const router = createRouter({
  routeTree,
  history: hashHistory,
});

// WebSocket: invalidate queries on real-time updates
subscribe((data) => {
  if (data.type === "new_email" || data.type === "email_updated") {
    queryClient.invalidateQueries({ queryKey: ["emails"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  }
  if (data.type === "sender_updated") {
    queryClient.invalidateQueries({ queryKey: ["senders"] });
    queryClient.invalidateQueries({ queryKey: ["emails"] });
  }
});

connect();

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
