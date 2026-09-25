import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/problems", label: "Problems" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/rules", label: "Rules" },
  { to: "/timeline", label: "Timeline" },
  { to: "/faq", label: "FAQ" },
  { to: "/help", label: "Help" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { state } = useStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-cyan"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {state.team ? (
            <button
              onClick={() => navigate({ to: "/app" })}
              className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Dashboard
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-border px-5 py-2 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              >
                Register
              </Link>
            </>
          )}
        </div>
        <button
          className="xl:hidden"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-surface px-4 py-4 xl:hidden">
          <nav className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground data-[status=active]:text-cyan"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            <Link
              to={state.team ? "/app" : "/login"}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold"
            >
              {state.team ? "Dashboard" : "Login"}
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-brand-gradient px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
