import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api.ts";
import { SenderRow } from "../components/sender-row.tsx";

export function SendersComponent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: senders, isLoading } = useQuery({
    queryKey: ["senders"],
    queryFn: () => api.getSenders(),
  });

  const filtered = senders?.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (
      search &&
      !s.address.toLowerCase().includes(search.toLowerCase()) &&
      !s.displayName?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search senders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="allowed">Allowed</option>
          <option value="blocked">Blocked</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center text-sm text-gray-500 py-8">Loading...</div>
      ) : !filtered?.length ? (
        <div className="text-center text-sm text-gray-500 py-8">No senders found</div>
      ) : (
        <>
          <p className="text-xs text-gray-500">{filtered.length} senders</p>
          {filtered.map((sender) => (
            <SenderRow key={sender.address} sender={sender} />
          ))}
        </>
      )}
    </div>
  );
}
