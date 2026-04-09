import { Outlet } from "@tanstack/react-router";
import { Nav } from "../components/nav.tsx";

export function RootComponent() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <h1 className="text-base font-semibold text-gray-900">Chatterbox3000</h1>
      </div>
      <Nav />
      <div className="flex-1 overflow-y-auto p-3">
        <Outlet />
      </div>
    </div>
  );
}
