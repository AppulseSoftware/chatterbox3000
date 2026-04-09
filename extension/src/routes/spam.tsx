import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.ts";
import { EmailCard } from "../components/email-card.tsx";

export function SpamComponent() {
  const { data: allEmails, isLoading } = useQuery({
    queryKey: ["emails", "pending"],
    queryFn: () => api.getEmails("pending"),
  });

  const emails = allEmails?.filter((e) => e.classification === "spam");

  if (isLoading) {
    return <div className="text-center text-sm text-gray-500 py-8">Loading...</div>;
  }

  if (!emails?.length) {
    return (
      <div className="text-center text-sm text-gray-500 py-8">No spam</div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-2">{emails.length} spam</p>
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} showActions />
      ))}
    </div>
  );
}
