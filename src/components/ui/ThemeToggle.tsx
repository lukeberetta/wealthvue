import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../../lib/utils";
import { ThemeMode } from "../../hooks/useTheme";
import { useThemeContext } from "../../App";

interface ThemeToggleProps {
    /** "compact" = nav icon pill, "labeled" = settings row with text */
    variant?: "compact" | "labeled";
}

const MODES: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun size={14} strokeWidth={1.75} />, label: "Light" },
    { value: "system", icon: <Monitor size={13} strokeWidth={1.75} />, label: "Device Default" },
    { value: "dark", icon: <Moon size={13} strokeWidth={1.75} />, label: "Dark" },
];

export function ThemeToggle({ variant = "compact" }: ThemeToggleProps) {
    const { mode, setTheme } = useThemeContext();

    if (variant === "labeled") {
        return (
            <div className="flex flex-col gap-2">
                <div className="theme-toggle w-full">
                    {MODES.map(m => (
                        <button
                            key={m.value}
                            onClick={() => setTheme(m.value)}
                            className={cn("theme-toggle-btn flex-1 gap-1.5 text-xs font-medium", mode === m.value && "active")}
                            style={{ width: "auto", paddingLeft: 10, paddingRight: 10 }}
                            aria-pressed={mode === m.value}
                            title={m.label}
                        >
                            {m.icon}
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>
                {mode === "system" && (
                    <p className="text-[11px] text-text-3">
                        Follows your device's appearance setting automatically.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="theme-toggle" role="group" aria-label="Theme">
            {MODES.map(m => (
                <button
                    key={m.value}
                    onClick={() => setTheme(m.value)}
                    className={cn("theme-toggle-btn", mode === m.value && "active")}
                    aria-pressed={mode === m.value}
                    title={m.label}
                >
                    {m.icon}
                </button>
            ))}
        </div>
    );
}
