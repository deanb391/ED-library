"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-[0.90]"
        onMouseEnter={() => setMounted(true)}
      >
        <Moon size={20} className="text-gray-500" />
      </button>
    );
  }

  const currentTheme = resolvedTheme ?? theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-[0.90]"
    >
      {isDark ? (
        <Sun size={20} className="text-gray-500 dark:text-gray-400" />
      ) : (
        <Moon size={20} className="text-gray-500" />
      )}
    </button>
  );
}
