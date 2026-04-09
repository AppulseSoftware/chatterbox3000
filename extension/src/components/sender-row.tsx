import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Sender } from "../lib/api.ts";
import { StatusBadge } from "./status-badge.tsx";

export function SenderRow({ sender }: { sender: Sender }) {
  const queryClient = useQueryClient();

  const allow = useMutation({
    mutationFn: () => api.allowSender(sender.address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senders"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const block = useMutation({
    mutationFn: () => api.blockSender(sender.address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senders"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const reset = useMutation({
    mutationFn: () => api.resetSender(sender.address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senders"] });
    },
  });

  const isPending = allow.isPending || block.isPending || reset.isPending;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {sender.displayName || sender.address}
          </p>
          {sender.displayName && (
            <p className="text-xs text-gray-500 truncate">{sender.address}</p>
          )}
        </div>
        <StatusBadge value={sender.status} />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{sender.emailCount || 0} emails</span>
        <span>First: {new Date(sender.firstSeen).toLocaleDateString()}</span>
        <span>Last: {new Date(sender.lastSeen).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-1.5 pt-1 border-t border-gray-100">
        {sender.status !== "allowed" && (
          <button
            onClick={() => allow.mutate()}
            disabled={isPending}
            className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50"
          >
            Allow
          </button>
        )}
        {sender.status !== "blocked" && (
          <button
            onClick={() => block.mutate()}
            disabled={isPending}
            className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
          >
            Block
          </button>
        )}
        {sender.status !== "unknown" && (
          <button
            onClick={() => reset.mutate()}
            disabled={isPending}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
