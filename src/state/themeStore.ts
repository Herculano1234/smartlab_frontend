import { create } from "zustand";

interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
}

const getInitialDarkMode = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: getInitialDarkMode(),
  toggleTheme: () =>
    set((state) => {
      const newMode = !state.darkMode;
      if (typeof document !== "undefined") {
        if (newMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return { darkMode: newMode };
    }),
}));

// Inicializa o tema ao carregar o app
if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark");
}
