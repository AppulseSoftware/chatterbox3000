import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Email } from "../lib/api.ts";
import { StatusBadge } from "./status-badge.tsx";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function EmailCard({
  email,
  showActions = false,
  showUndo = false,
}: {
  email: Email;
  showActions?: boolean;
  showUndo?: boolean;
}) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["emails"] });
    queryClient.invalidateQueries({ queryKey: ["senders"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const approve = useMutation({
    mutationFn: () => api.approveEmail(email.id),
    onSuccess: invalidateAll,
  });

  const reject = useMutation({
    mutationFn: () => api.rejectEmail(email.id),
    onSuccess: invalidateAll,
  });

  const isPending = approve.isPending || reject.isPending;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {email.fromHeader}
          </p>
          <p className="text-xs text-gray-500 truncate">{email.sender}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge value={email.classification} />
          <span className="text-xs text-gray-400">{timeAgo(email.createdAt)}</span>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-800">{email.subject || "(no subject)"}</p>

      {email.bodyPreview && (
        <p className="text-xs text-gray-500 line-clamp-2">{email.bodyPreview}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs">
        {email.spfPass && <span className="text-green-600">SPF ✓</span>}
        {email.dkimPass && <span className="text-green-600">DKIM ✓</span>}
        {!email.spfPass && email.spfPass !== null && <span className="text-red-600">SPF ✗</span>}
        {!email.dkimPass && email.dkimPass !== null && <span className="text-red-600">DKIM ✗</span>}
      </div>

      {showActions && (
        <div className="flex gap-1.5 pt-1 border-t border-gray-100">
          <button
            onClick={() => approve.mutate()}
            disabled={isPending}
            className="px-2.5 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            👍 Approve
          </button>
          <button
            onClick={() => reject.mutate()}
            disabled={isPending}
            className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
          >
            👎 Reject
          </button>
        </div>
      )}

      {showUndo && email.status === "rejected" && (
        <div className="pt-1 border-t border-gray-100">
          <button
            onClick={() => approve.mutate()}
            disabled={isPending}
            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            Undo (Move to Pending)
          </button>
        </div>
      )}
    </div>
  );
}
