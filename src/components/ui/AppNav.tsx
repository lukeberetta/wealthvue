import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Settings, LogOut, LayoutDashboard, Globe } from "lucide-react";
import { User } from "../../types";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "./ThemeToggle";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getInitials(displayName: string): string {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Consistent warm background for each initials string (deterministic)
const AVATAR_PALETTES = [
    "bg-[#8B6B52] text-[#F0EBE3]",
    "bg-[#5D6B52] text-[#F0EBE3]",
    "bg-[#526B6B] text-[#F0EBE3]",
    "bg-[#6B525D] text-[#F0EBE3]",
    "bg-[#6B6B52] text-[#F0EBE3]",
];
function avatarPalette(name: string) {
    let hash = 0;
    for (const c of name) hash = ((hash << 5) - hash) + c.charCodeAt(0);
    return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AppNavProps {
    user: User | null;
    isDemo?: boolean;
    /** If provided, renders a currency selector in the nav */
    displayCurrency?: string;
    fxRates?: Record<string, number>;
    onDisplayCurrencyChange?: (c: string) => void;
    /** Called when "Sign In" is needed from a logged-out state */
    onSignIn?: () => void;
    /** Called when "Try Free" is clicked from marketing state */
    onTryDemo?: () => void;
    onSignOut?: () => void;
    /** Opens the Settings view (only meaningful inside the app) */
    onOpenSettings?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AppNav({
    user,
    isDemo = false,
    displayCurrency,
    fxRates,
    onDisplayCurrencyChange,
    onSignIn,
    onTryDemo,
    onSignOut,
    onOpenSettings,
}: AppNavProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const isOnApp = location.pathname.startsWith("/app");

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close account menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    const initials = user ? getInitials(user.displayName) : "";
    const palette = user ? avatarPalette(user.displayName) : "";

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 flex flex-col text-text-1 transition-all duration-300",
                scrolled
                    ? "bg-surface/85 backdrop-blur-md border-b border-border shadow-sm"
                    : "bg-bg sm:bg-transparent"
            )}
        >
            {/* Demo banner */}
            {isDemo && isOnApp && (
                <div className="bg-accent text-white py-2 text-center text-xs font-bold uppercase tracking-widest shrink-0">
                    DEMO MODE ·{" "}
                    <button onClick={onSignIn} className="underline hover:no-underline">
                        Sign in
                    </button>{" "}
                    to track your real assets
                </div>
            )}
            <div className={cn(
                "max-w-[1120px] mx-auto w-full px-6 flex items-center justify-between transition-all duration-300 shrink-0",
                scrolled ? "py-3" : "py-5"
            )}>

                {/* ── Logo ── */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    aria-label="WealthVue home"
                >
                    <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
                        <span className="text-white font-serif font-bold text-sm leading-none">W</span>
                    </div>
                    <span className="font-serif text-xl font-semibold text-accent tracking-tight hidden sm:block">
                        WealthVue
                    </span>
                </button>

                {/* ── Right controls ── */}
                <div className="flex items-center gap-2.5">

                    {/* Cross-nav pill: landing → app or app → site */}
                    {isOnApp && (
                        <button
                            onClick={() => navigate("/")}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-text-3 hover:text-text-1 transition-colors px-3 py-1.5 rounded-full hover:bg-surface-2 border border-transparent hover:border-border"
                        >
                            <Globe size={13} />
                            Website
                        </button>
                    )}
                    {!isOnApp && (
                        <button
                            onClick={() => {
                                if (!user) {
                                    onTryDemo?.();
                                } else {
                                    navigate("/app");
                                }
                            }}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-text-3 hover:text-text-1 transition-colors px-3 py-1.5 rounded-full hover:bg-surface-2 border border-transparent hover:border-border"
                        >
                            <LayoutDashboard size={13} />
                            Dashboard
                        </button>
                    )}

                    <ThemeToggle variant="compact" />

                    {/* Separator */}
                    <div className="w-px h-4 bg-border mx-0.5" />

                    {/* Currency selector — only when inside app */}
                    {displayCurrency && fxRates && onDisplayCurrencyChange && (
                        <>
                            <div className="relative">
                                <select
                                    value={displayCurrency}
                                    onChange={e => onDisplayCurrencyChange(e.target.value)}
                                    className="appearance-none bg-surface-2 border border-border rounded-full pl-3 pr-8 py-1.5 text-xs font-bold text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                                    aria-label="Display currency"
                                >
                                    {Object.keys(fxRates).sort().map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={11}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-3"
                                />
                            </div>
                            <div className="w-px h-4 bg-border mx-0.5" />
                        </>
                    )}

                    {/* ── Account area ── */}
                    {isDemo ? (
                        /* Demo mode: single CTA */
                        <button
                            onClick={onSignIn}
                            className="btn-primary px-4 py-1.5 text-xs rounded-full"
                        >
                            Sign In
                        </button>
                    ) : user ? (
                        /* Signed-in: initials avatar + dropdown */
                        <div className="relative">
                            <button
                                id="nav-account-btn"
                                onClick={() => setMenuOpen(o => !o)}
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-2 border border-transparent hover:border-border transition-all duration-150"
                                aria-expanded={menuOpen}
                                aria-haspopup="true"
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide shrink-0",
                                    palette
                                )}>
                                    {initials}
                                </div>
                                <ChevronDown
                                    size={13}
                                    className={cn("text-text-3 transition-transform duration-200", menuOpen && "rotate-180")}
                                />
                            </button>

                            <AnimatePresence>
                                {menuOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setMenuOpen(false)}
                                        />
                                        {/* Dropdown */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                                            role="menu"
                                        >
                                            {/* User info */}
                                            <div className="px-5 py-4 border-b border-border bg-surface-2/30 flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                                                    palette
                                                )}>
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-text-1 truncate">{user.displayName}</p>
                                                    <p className="text-[11px] text-text-3 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* Plan badge */}
                                            <div className="px-5 py-2.5 border-b border-border/50">
                                                <span className="inline-block px-2 py-0.5 bg-accent-light text-accent text-[9px] font-bold rounded-full uppercase tracking-wider">
                                                    {user.plan} Plan
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="p-2">
                                                {onOpenSettings && (
                                                    <button
                                                        onClick={() => { onOpenSettings(); setMenuOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-xl transition-colors"
                                                        role="menuitem"
                                                    >
                                                        <Settings size={15} strokeWidth={1.75} />
                                                        Settings
                                                    </button>
                                                )}
                                                {isOnApp && !onOpenSettings && (
                                                    <button
                                                        onClick={() => { navigate("/app"); setMenuOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-xl transition-colors"
                                                        role="menuitem"
                                                    >
                                                        <LayoutDashboard size={15} strokeWidth={1.75} />
                                                        Dashboard
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { onSignOut?.(); setMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-negative hover:bg-negative/5 rounded-xl transition-colors"
                                                    role="menuitem"
                                                >
                                                    <LogOut size={15} strokeWidth={1.75} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* Logged out on marketing pages */
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onSignIn}
                                className="btn-primary px-5 py-2 text-sm rounded-full"
                            >
                                Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
