const COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  forwarded: "bg-blue-100 text-blue-800",
  cold_outreach: "bg-orange-100 text-orange-800",
  spam: "bg-red-100 text-red-800",
  newsletter: "bg-purple-100 text-purple-800",
  legitimate: "bg-green-100 text-green-800",
  unknown: "bg-gray-100 text-gray-800",
  allowed: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
};

export function StatusBadge({ value }: { value: string | null }) {
  if (!value) return null;
  const color = COLORS[value] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {value.replace("_", " ")}
    </span>
  );
}
