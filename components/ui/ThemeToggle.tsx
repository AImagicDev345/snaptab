"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

// Same key the pre-hydration boot script reads/writes in layout.tsx.
const STORAGE_KEY = "snaptab:theme";

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync from what the boot script already applied to <html>.
    setTheme(readInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — private mode blocks storage, toggle still works for this tab
    }
  }

  // Render a stable icon-sized placeholder before hydration to avoid FOUC.
  const isDark = mounted ? theme === "dark" : false;
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="press no-tap-highlight inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-fg hover:bg-surface-strong"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
