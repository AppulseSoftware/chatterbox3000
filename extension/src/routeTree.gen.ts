import { createRoute, createRootRoute } from "@tanstack/react-router";
import { RootComponent } from "./routes/__root.tsx";
import { IndexComponent } from "./routes/index.tsx";
import { PendingComponent } from "./routes/pending.tsx";
import { ApprovedComponent } from "./routes/approved.tsx";
import { RejectedComponent } from "./routes/rejected.tsx";
import { SendersComponent } from "./routes/senders.tsx";
import { SpamComponent } from "./routes/spam.tsx";
import { SettingsComponent } from "./routes/settings.tsx";

const rootRoute = createRootRoute({ component: RootComponent });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

const pendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pending",
  component: PendingComponent,
});

const approvedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/approved",
  component: ApprovedComponent,
});

const rejectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rejected",
  component: RejectedComponent,
});

const spamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/spam",
  component: SpamComponent,
});

const sendersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/senders",
  component: SendersComponent,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsComponent,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  pendingRoute,
  approvedRoute,
  rejectedRoute,
  spamRoute,
  sendersRoute,
  settingsRoute,
]);
