import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "../lib/api.ts";
import { getLocalSettings, saveLocalSettings } from "../lib/storage.ts";
import { isConnected, connect, disconnect } from "../lib/ws.ts";

export function SettingsComponent() {
  const queryClient = useQueryClient();

  const [apiUrl, setApiUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getLocalSettings().then((s) => {
      setApiUrl(s.apiUrl);
      setAuthToken(s.authToken);
    });
  }, []);

  const handleSaveConnection = async () => {
    await saveLocalSettings({ apiUrl, authToken });
    disconnect();
    await connect();
    queryClient.invalidateQueries();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const { data: serverSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
    retry: false,
  });

  const updateServer = useMutation({
    mutationFn: (updates: Record<string, string>) =>
      api.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const [destinationEmail, setDestinationEmail] = useState("");
  const [autoForward, setAutoForward] = useState(false);
  const [autoReject, setAutoReject] = useState(false);

  useEffect(() => {
    if (serverSettings) {
      setDestinationEmail(serverSettings.destination_email || "");
      setAutoForward(serverSettings.auto_forward_allowed === "true");
      setAutoReject(serverSettings.auto_reject_blocked === "true");
    }
  }, [serverSettings]);

  const handleSaveServer = () => {
    updateServer.mutate({
      destination_email: destinationEmail,
      auto_forward_allowed: String(autoForward),
      auto_reject_blocked: String(autoReject),
    });
  };

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-900">Connection</h2>
        <div>
          <label className="block text-xs text-gray-600 mb-1">API URL</label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://email-gateway.your-worker.workers.dev"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Auth Token</label>
          <input
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Bearer token"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveConnection}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save & Connect
          </button>
          {saved && <span className="text-xs text-green-600">Saved!</span>}
          <span
            className={`ml-auto text-xs ${isConnected() ? "text-green-600" : "text-gray-400"}`}
          >
            {isConnected() ? "Connected" : "Disconnected"}
          </span>
        </div>
      </section>

      {serverSettings && (
        <section className="space-y-2 border-t border-gray-200 pt-4">
          <h2 className="text-sm font-semibold text-gray-900">Server Settings</h2>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Destination Email
            </label>
            <input
              type="email"
              value={destinationEmail}
              onChange={(e) => setDestinationEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoForward}
              onChange={(e) => setAutoForward(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-forward from allowed senders
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoReject}
              onChange={(e) => setAutoReject(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-reject from blocked senders
          </label>
          <button
            onClick={handleSaveServer}
            disabled={updateServer.isPending}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {updateServer.isPending ? "Saving..." : "Save Server Settings"}
          </button>
        </section>
      )}
    </div>
  );
}
