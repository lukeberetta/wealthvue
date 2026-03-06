import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Settings, LogOut, LayoutDashboard, Globe, MessageSquare } from "lucide-react";
import { User } from "../types";
import { cn, getInitials, avatarPalette } from "../lib/utils";
import { ThemeToggle } from "../components/ui/ThemeToggle";

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
    /** Opens the Feedback modal */
    onOpenFeedback?: () => void;
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
    onOpenFeedback,
}: AppNavProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const isOnApp = location.pathname.startsWith("/app");

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    useEffect(() => {
        let rafId: number;
        const onScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 12));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    // Close account menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    const initials = user ? getInitials(user.displayName) : "";
    const palette = user ? avatarPalette(user.displayName) : "";

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 flex flex-col text-text-1 bg-bg/80 backdrop-blur-md border-b transition-colors duration-300",
                scrolled ? "border-border" : "border-transparent"
            )}
        >
            {/* Demo banner */}
            {isDemo && isOnApp && (
                <button onClick={onSignIn} className="bg-accent text-on-accent py-2 shrink-0 overflow-hidden w-full cursor-pointer hover:bg-accent/90 transition-colors">
                    <div
                        className="flex whitespace-nowrap text-xs font-normal uppercase tracking-widest"
                        style={{ animation: "ticker 35s linear infinite" }}
                    >
                        {[0, 1].map(i => (
                            <span key={i}>
                                You're exploring WealthVue in demo mode
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                Sign in free to track your real portfolio
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                AI-powered asset entry — stocks, crypto, property &amp; more
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                Live FX conversion across 30+ currencies
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                See your true net worth in real time
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                Create your free account →
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                        ))}
                    </div>
                </button>
            )}
            <div className="max-w-[1120px] mx-auto w-full px-6 flex items-center justify-between py-4 shrink-0">

                {/* ── Logo ── */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    aria-label="WealthVue home"
                >
                    <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-1 shrink-0">
                        <rect width="256" height="256" rx="48" fill="currentColor"/>
                        <path d="M83.3 159.841C82.3363 162.681 79.6704 164.591 76.6713 164.591H60.9572C58.1196 164.591 55.5627 162.878 54.4834 160.254L29.9741 100.663C28.0794 96.0558 31.4667 91 36.448 91H46.2728C49.1908 91 51.8026 92.81 52.8272 95.5421L63.0808 122.885C65.4071 129.089 74.2504 128.889 76.2938 122.586L84.9651 95.8411C85.9009 92.9548 88.5896 91 91.6238 91H106.061C109.054 91 111.716 92.9027 112.684 95.7345L121.588 121.765C123.711 127.971 132.438 128.111 134.759 121.976L144.765 95.5234C145.795 92.8011 148.401 91 151.312 91H158.744C163.708 91 167.094 96.0236 165.233 100.625L141.124 160.216C140.054 162.861 137.487 164.591 134.635 164.591H121.032C118.079 164.591 115.443 162.738 114.445 159.959L105.181 134.188C102.94 127.953 94.0946 128.032 91.9654 134.306L83.3 159.841Z" style={{ fill: 'var(--color-bg)' }}/>
                        <path d="M143.344 159.841C142.38 162.681 139.715 164.591 136.716 164.591H121.001C118.164 164.591 115.607 162.878 114.528 160.254L90.0183 100.663C88.1236 96.0558 91.5109 91 96.4922 91H106.317C109.235 91 111.847 92.81 112.871 95.5421L123.125 122.885C125.451 129.089 134.295 128.889 136.338 122.586L145.009 95.8411C145.945 92.9548 148.634 91 151.668 91H166.105C169.098 91 171.76 92.9027 172.729 95.7345L181.632 121.765C183.755 127.971 192.482 128.111 194.803 121.976L204.809 95.5234C205.839 92.8011 208.446 91 211.356 91H218.788C223.752 91 227.139 96.0236 225.277 100.625L201.168 160.216C200.098 162.861 197.531 164.591 194.679 164.591H181.076C178.123 164.591 175.488 162.738 174.489 159.959L165.226 134.188C162.984 127.953 154.139 128.032 152.01 134.306L143.344 159.841Z" style={{ fill: 'var(--color-bg)' }}/>
                    </svg>
                    <span className="font-serif text-xl font-normal text-text-1 tracking-tight hidden sm:block">
                        WealthVue
                    </span>
                </button>

                {/* ── Right controls ── */}
                <div className="flex items-center gap-2.5">

                    {/* Cross-nav pill: landing → app or app → site */}
                    {isOnApp && (
                        <button
                            onClick={() => navigate("/")}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-normal text-text-3 hover:text-text-1 transition-colors px-3 py-1.5 rounded-full hover:bg-surface-2 border border-transparent hover:border-border"
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
                            className="hidden sm:flex items-center gap-1.5 text-xs font-normal text-text-3 hover:text-text-1 transition-colors px-3 py-1.5 rounded-full hover:bg-surface-2 border border-transparent hover:border-border"
                        >
                            <LayoutDashboard size={13} />
                            Dashboard
                        </button>
                    )}

                    <ThemeToggle variant="compact" />

                    {/* Separator */}
                    <div className="hidden sm:block w-px h-4 bg-border mx-0.5" />

                    {/* Currency selector — only when inside app */}
                    {displayCurrency && fxRates && onDisplayCurrencyChange && (
                        <>
                            <div className="relative hidden sm:block">
                                <select
                                    value={displayCurrency}
                                    onChange={e => onDisplayCurrencyChange(e.target.value)}
                                    className="appearance-none bg-surface-2 border border-border rounded-full pl-3 pr-8 py-1.5 text-xs font-normal text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
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
                            <div className="hidden sm:block w-px h-4 bg-border mx-0.5" />
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
                        <div className="relative" ref={menuRef}>
                            <button
                                id="nav-account-btn"
                                onClick={() => setMenuOpen(o => !o)}
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-2 border border-transparent hover:border-border transition-all duration-150"
                                aria-expanded={menuOpen}
                                aria-haspopup="true"
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-normal tracking-wide shrink-0",
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
                                        {/* Dropdown */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                                            role="menu"
                                        >
                                            {/* User info */}
                                            <div className="px-5 py-4 border-b border-border bg-surface-2/30 flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-normal shrink-0",
                                                    palette
                                                )}>
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-normal text-text-1 truncate">{user.displayName}</p>
                                                    <p className="text-[11px] text-text-3 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* Plan badge */}
                                            <div className="px-5 py-2.5 border-b border-border/50">
                                                <span className="inline-block px-2 py-0.5 bg-surface-3 text-text-2 text-[9px] font-normal rounded-full uppercase tracking-wider">
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
                                                {onOpenFeedback && (
                                                    <button
                                                        onClick={() => { onOpenFeedback(); setMenuOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-xl transition-colors"
                                                        role="menuitem"
                                                    >
                                                        <MessageSquare size={15} strokeWidth={1.75} />
                                                        Send Feedback
                                                    </button>
                                                )}
                                                {!isOnApp && (
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
