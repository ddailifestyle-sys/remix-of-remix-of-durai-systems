import { Link } from "@tanstack/react-router";
import { ArrowDownRight, FileText } from "lucide-react";
import type { ReactNode } from "react";

interface SystemButtonProps {
  children: ReactNode;
  kind?: "primary" | "secondary";
  to?: "/resume";
  onClick?: () => void;
}

const base = "group inline-flex min-h-12 items-center justify-center gap-3 border px-5 font-mono text-xs font-semibold tracking-[0.16em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const styles = {
  primary: "border-primary bg-primary text-primary-foreground shadow-signal hover:bg-primary/90",
  secondary: "border-border bg-surface/70 text-foreground hover:border-primary/60 hover:bg-accent",
};

export function SystemButton({ children, kind = "primary", to, onClick }: SystemButtonProps) {
  const content = <>{kind === "secondary" ? <FileText aria-hidden="true" className="size-4" /> : null}<span>{children}</span><ArrowDownRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></>;
  if (to) return <Link to={to} className={`${base} ${styles[kind]}`}>{content}</Link>;
  return <button type="button" onClick={onClick} className={`${base} ${styles[kind]}`}>{content}</button>;
}