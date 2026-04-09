import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api.ts";
import { EmailCard } from "../components/email-card.tsx";

export function RejectedComponent() {
  const [search, setSearch] = useState("");

  const { data: emails, isLoading } = useQuery({
    queryKey: ["emails", "rejected"],
    queryFn: () => api.getEmails("rejected"),
  });

  const filtered = emails?.filter(
    (e) =>
      !search ||
      e.sender.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.fromHeader.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search rejected emails..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {isLoading ? (
        <div className="text-center text-sm text-gray-500 py-8">Loading...</div>
      ) : !filtered?.length ? (
        <div className="text-center text-sm text-gray-500 py-8">No rejected emails</div>
      ) : (
        filtered.map((email) => (
          <EmailCard key={email.id} email={email} showUndo />
        ))
      )}
    </div>
  );
}
