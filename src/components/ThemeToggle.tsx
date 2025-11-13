import React from "react";
import { useThemeStore } from "../state/themeStore";

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useThemeStore();
  return (
    <button
      onClick={toggleTheme}
      className="bg-moyo-primary text-white px-4 py-2 rounded shadow hover:bg-moyo-secondary transition"
    >
      {darkMode ? "Modo Claro" : "Modo Escuro"}
    </button>
  );
}
