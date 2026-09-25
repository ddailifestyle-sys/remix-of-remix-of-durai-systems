import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("simlab-theme") === "light";
    setLight(saved);
    document.documentElement.classList.toggle("light", saved);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    window.localStorage.setItem("simlab-theme", next ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
    >
      <Sun className={`h-4 w-4 ${light ? "text-warning" : ""}`} />
      <Moon className={`h-4 w-4 ${light ? "" : "text-cyan"}`} />
    </button>
  );
}
