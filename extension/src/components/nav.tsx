import { Link, useRouterState } from "@tanstack/react-router";

const TABS = [
  { to: "/pending", label: "Pending" },
  { to: "/approved", label: "Approved" },
  { to: "/rejected", label: "Rejected" },
  { to: "/spam", label: "Spam" },
  { to: "/senders", label: "Senders" },
  { to: "/settings", label: "Settings" },
] as const;

export function Nav() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <nav className="flex border-b border-gray-200 bg-white px-1">
      {TABS.map((tab) => {
        const isActive = pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
