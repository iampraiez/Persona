import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  // Direct initialization to prevent flicker
  const savedTheme = (
    typeof window !== "undefined" ? localStorage.getItem("theme") : null
  ) as Theme | null;

  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

  // Apply immediately if in browser
  if (typeof window !== "undefined") {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
  }

  return {
    theme: initialTheme,

    setTheme: (theme: Theme) => {
      localStorage.setItem("theme", theme);
      set({ theme });
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    },

    toggleTheme: () => {
      const newTheme = get().theme === "dark" ? "light" : "dark";
      get().setTheme(newTheme);
    },

    initTheme: () => {
      // Logic now handles everything in constructor and setTheme
      // but keeping for compatibility if needed.
      const theme = get().theme;
      get().setTheme(theme);
    },
  };
});
