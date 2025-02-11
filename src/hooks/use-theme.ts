import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar preferência salva no localStorage
    const savedTheme = window.localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Atualizar classe no documento
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Salvar preferência
    window.localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Função para alternar tema
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Função para definir tema específico
  const setThemeMode = (mode: Theme) => {
    setTheme(mode);
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === "dark",
    mounted
  };
} 