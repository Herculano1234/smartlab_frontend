import { useEffect } from "react";
import { useThemeStore } from "../state/themeStore";

export function useDarkMode() {
  const { darkMode } = useThemeStore();
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode]);
}
