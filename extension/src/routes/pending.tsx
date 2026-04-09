import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.ts";
import { EmailCard } from "../components/email-card.tsx";

export function PendingComponent() {
  const { data: allEmails, isLoading, error } = useQuery({
    queryKey: ["emails", "pending"],
    queryFn: () => api.getEmails("pending"),
    refetchInterval: 30000,
  });

  const emails = allEmails?.filter((e) => e.classification !== "spam");

  if (isLoading) {
    return <div className="text-center text-sm text-gray-500 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-sm text-red-500 py-8">
        Failed to load emails. Check your settings.
      </div>
    );
  }

  if (!emails?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No pending emails</p>
        <p className="text-xs text-gray-400 mt-1">New emails will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-2">{emails.length} pending</p>
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} showActions />
      ))}
    </div>
  );
}
