import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "wealthvue-theme";

function getSystemPrefersDark(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode: ThemeMode) {
    const root = document.documentElement;
    const isDark = mode === "dark" || (mode === "system" && getSystemPrefersDark());
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
}

export function useTheme() {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        return saved ?? "system";
    });

    // Apply on mount and whenever mode changes
    useEffect(() => {
        applyTheme(mode);
    }, [mode]);

    // Listen for system preference changes when in system mode
    useEffect(() => {
        if (mode !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => applyTheme("system");
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [mode]);

    const setTheme = useCallback((newMode: ThemeMode) => {
        localStorage.setItem(STORAGE_KEY, newMode);
        setMode(newMode);
    }, []);

    return { mode, setTheme };
}
