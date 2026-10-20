import { BarChart3, History, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router";

import { useHealth } from "../hooks/queries";

const LINKS = [
  { to: "/", label: "Generate", Icon: Sparkles, end: true },
  { to: "/history", label: "History", Icon: History, end: false },
  { to: "/insights", label: "Insights", Icon: BarChart3, end: false },
];

function HealthIndicator() {
  const health = useHealth();
  if (health.isPending) return <span className="text-xs text-ink-3">Checking backend…</span>;
  if (health.isError) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-medium text-danger" title={health.error.message}>
        <span className="size-2 rounded-full bg-danger" aria-hidden />
        Backend offline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-3" title="Backend and database are reachable">
      <span className="size-2 rounded-full bg-ok" aria-hidden />
      Online · {health.data.model}
    </span>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-brand text-sm font-bold text-white">in</span>
            {import.meta.env.VITE_APP_NAME ?? "LinkedIn Post Agent"}
          </div>
          <nav className="flex gap-1" aria-label="Main">
            {LINKS.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-sunken hover:text-ink"
                  }`
                }
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <HealthIndicator />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
