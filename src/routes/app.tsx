import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  CircuitBoard,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Trophy,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { initials, useStore } from "@/lib/store";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/problems", label: "Problems", icon: ListChecks, exact: false },
  { to: "/app/builder", label: "Circuit Builder", icon: CircuitBoard, exact: false },
  { to: "/app/leaderboard", label: "Leaderboard", icon: Trophy, exact: false },
  { to: "/app/profile", label: "Profile", icon: UserRound, exact: false },
] as const;

function AppLayout() {
  const { state, ready, update } = useStore();
  const navigate = useNavigate();

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!state.team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in or create an account to open the dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Login
            </Link>
            <Link to="/register" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const team = state.team;

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 z-40 flex items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 py-3 lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <Logo compact />
        <nav className="flex flex-1 gap-1 overflow-x-auto lg:mt-8 lg:flex-col lg:overflow-visible">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-cyan"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 border-t border-sidebar-border pt-4 lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-primary-foreground">
            {initials(team.teamName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{team.teamName}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{team.teamId}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 lg:px-8">
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{team.teamName}</span>
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                update((s) => ({ ...s, team: null }));
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>
        <main className="px-4 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
