import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Coins, Car, Home, Wallet, MoreHorizontal,
    Check, ArrowRight, Search
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { AppNav } from "../../layouts/AppNav";
import { Footer } from "../../layouts/Footer";

interface LandingPageProps {
    user: import("../../types").User | null;
    firebaseUid?: string;
    isDemo?: boolean;
    onSignIn: () => void;
    onTryDemo: () => void;
    onSignOut?: () => void;
    onOpenSettings?: () => void;
    onOpenFeedback?: () => void;
}

const TICKER_ITEMS: Array<{ label: string; sub: string; value: string; change: string; up: boolean | null }> = [
    { label: "AAPL", sub: "Apple Inc", value: "R 86,200", change: "+1.8%", up: true },
    { label: "BTC", sub: "Bitcoin", value: "R 534,100", change: "+4.3%", up: true },
    { label: "BMW", sub: "2022 3 Series", value: "R 420,000", change: "AI estimate", up: null },
    { label: "TSLA", sub: "Tesla", value: "R 182,400", change: "−0.8%", up: false },
    { label: "ETH", sub: "Ethereum", value: "R 97,800", change: "+1.9%", up: true },
    { label: "FNB", sub: "FNB Savings", value: "R 142,000", change: "Manual", up: null },
    { label: "VTI", sub: "Vanguard Total Mkt", value: "R 45,200", change: "+0.4%", up: true },
    { label: "SOL", sub: "Solana", value: "R 28,400", change: "+6.2%", up: true },
];

export const LandingPage = ({ user, firebaseUid, isDemo = false, onSignIn, onTryDemo, onSignOut, onOpenSettings, onOpenFeedback }: LandingPageProps) => {
    useScrollReveal();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg text-text-1 selection:bg-accent/20">

            <AppNav
                user={user}
                isDemo={isDemo}
                onSignIn={onSignIn}
                onTryDemo={onTryDemo}
                onSignOut={onSignOut}
                onOpenSettings={onOpenSettings}
                onOpenFeedback={onOpenFeedback}
            />

            <main>

                {/* ── HERO ── */}
                <section className="min-h-screen flex flex-col pt-20 relative overflow-hidden">
                    {/* Centered text content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    {/* Ambient glow */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 w-[700px] h-[500px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, var(--color-accent), transparent 70%)', opacity: 0.05 }}
                    />

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-[10px] font-normal tracking-[0.25em] text-text-3 uppercase mb-10"
                    >
                        AI-powered wealth tracking
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.08 }}
                        className="text-[3.25rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7rem] font-serif leading-[1.02] text-text-1"
                    >
                        Every asset.<br />
                        One clear{" "}
                        <span className="text-accent italic">picture.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-base md:text-lg text-text-2 max-w-xs sm:max-w-sm mt-8 leading-relaxed"
                    >
                        Stocks, crypto, property, vehicles, and cash — unified in one AI-powered net worth dashboard.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 mt-10"
                    >
                        <button
                            onClick={onTryDemo}
                            className="btn-primary flex items-center gap-2 px-8 py-3.5 text-sm"
                        >
                            Try it free
                            <ArrowRight size={15} />
                        </button>
                        <button
                            onClick={onSignIn}
                            className="text-sm text-text-2 hover:text-text-1 transition-colors underline underline-offset-4 decoration-text-3/50"
                        >
                            Sign in
                        </button>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                        className="text-xs text-text-3 mt-5"
                    >
                        30-day free trial · No credit card required
                    </motion.p>
                    </div>{/* end centered content */}

                    {/* Asset ticker strip — pinned to bottom */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="w-full overflow-hidden border-t border-border"
                    >
                        <div
                            className="flex whitespace-nowrap"
                            style={{ animation: "ticker 45s linear infinite" }}
                        >
                            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                                <div
                                    key={i}
                                    className="inline-flex items-center gap-3 px-6 py-4 border-r border-border shrink-0"
                                >
                                    <div className="w-7 h-7 bg-surface-2 rounded-md flex items-center justify-center text-[9px] font-normal text-text-2 shrink-0">
                                        {item.label[0]}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-normal text-text-1">{item.label}</p>
                                        <p className="text-[9px] text-text-3 leading-none mt-0.5">{item.sub}</p>
                                    </div>
                                    <div className="text-right pl-2">
                                        <p className="text-[11px] font-normal tabular-nums text-text-1">{item.value}</p>
                                        <p className={cn(
                                            "text-[9px] tabular-nums leading-none mt-0.5",
                                            item.up === true ? "text-positive" : item.up === false ? "text-negative" : "text-text-3"
                                        )}>
                                            {item.change}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section id="how-it-works" className="py-32 px-6 border-t border-border">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="max-w-2xl mb-20 fade-up">
                            <p className="text-[10px] font-normal tracking-[0.22em] text-accent uppercase mb-5">How it works</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-text-1 mb-5">
                                From screenshot to<br />net worth in{" "}
                                <span className="text-accent italic">seconds.</span>
                            </h2>
                            <p className="text-base text-text-2 leading-relaxed">
                                No manual data entry. No API keys. No bank account linking. Just describe what you own — or show us a screenshot.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-5">

                            {/* Step 01 */}
                            <div className="bg-surface p-8 rounded-2xl space-y-4 fade-up">
                                <div className="text-[9px] font-normal tracking-[0.2em] text-accent uppercase">01</div>
                                <h3 className="text-lg font-serif text-text-1 leading-snug">Upload or describe</h3>
                                <p className="text-sm text-text-2 leading-relaxed">A screenshot from your brokerage, '2020 VW Polo 50k km', or '0.5 Bitcoin'. Any format works.</p>
                            </div>

                            {/* Step 02 */}
                            <div className="bg-surface p-8 rounded-2xl space-y-4 fade-up" style={{ transitionDelay: "80ms" }}>
                                <div className="text-[9px] font-normal tracking-[0.2em] text-accent uppercase">02</div>
                                <h3 className="text-lg font-serif text-text-1 leading-snug">AI does the valuation</h3>
                                <p className="text-sm text-text-2 leading-relaxed">Gemini reads your input, identifies the asset, and fetches live market data. Stocks, crypto, and cars handled automatically.</p>
                            </div>

                            {/* Step 03 */}
                            <div className="bg-surface p-8 rounded-2xl space-y-4 fade-up" style={{ transitionDelay: "160ms" }}>
                                <div className="text-[9px] font-normal tracking-[0.2em] text-accent uppercase">03</div>
                                <h3 className="text-lg font-serif text-text-1 leading-snug">Your net worth, updated</h3>
                                <p className="text-sm text-text-2 leading-relaxed">Every asset tracked in your preferred currency. One clean number — updated whenever the markets move.</p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── THE PRODUCT ── */}
                <section className="py-32 px-6 border-t border-border">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-14 fade-up">
                            <p className="text-[10px] font-normal tracking-[0.22em] text-accent uppercase mb-5">The dashboard</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-text-1 mb-5">
                                One view. Every number that matters.
                            </h2>
                            <p className="text-sm text-text-2 leading-relaxed max-w-md mx-auto">
                                Live prices for stocks and crypto. AI-estimated values for everything else. All in your preferred currency.
                            </p>
                        </div>

                        {/* Dashboard mockup — centered */}
                        <div
                            className="max-w-[860px] mx-auto bg-surface rounded-2xl border border-border overflow-hidden fade-up"
                            style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.35)' }}
                        >
                                {/* Mockup nav */}
                                <div className="bg-surface-2/60 border-b border-border px-5 py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-1 shrink-0">
                                            <rect width="256" height="256" rx="48" fill="currentColor"/>
                                            <path d="M83.3 159.841C82.3363 162.681 79.6704 164.591 76.6713 164.591H60.9572C58.1196 164.591 55.5627 162.878 54.4834 160.254L29.9741 100.663C28.0794 96.0558 31.4667 91 36.448 91H46.2728C49.1908 91 51.8026 92.81 52.8272 95.5421L63.0808 122.885C65.4071 129.089 74.2504 128.889 76.2938 122.586L84.9651 95.8411C85.9009 92.9548 88.5896 91 91.6238 91H106.061C109.054 91 111.716 92.9027 112.684 95.7345L121.588 121.765C123.711 127.971 132.438 128.111 134.759 121.976L144.765 95.5234C145.795 92.8011 148.401 91 151.312 91H158.744C163.708 91 167.094 96.0236 165.233 100.625L141.124 160.216C140.054 162.861 137.487 164.591 134.635 164.591H121.032C118.079 164.591 115.443 162.738 114.445 159.959L105.181 134.188C102.94 127.953 94.0946 128.032 91.9654 134.306L83.3 159.841Z" style={{ fill: 'var(--color-surface-2)' }}/>
                                            <path d="M143.344 159.841C142.38 162.681 139.715 164.591 136.716 164.591H121.001C118.164 164.591 115.607 162.878 114.528 160.254L90.0183 100.663C88.1236 96.0558 91.5109 91 96.4922 91H106.317C109.235 91 111.847 92.81 112.871 95.5421L123.125 122.885C125.451 129.089 134.295 128.889 136.338 122.586L145.009 95.8411C145.945 92.9548 148.634 91 151.668 91H166.105C169.098 91 171.76 92.9027 172.729 95.7345L181.632 121.765C183.755 127.971 192.482 128.111 194.803 121.976L204.809 95.5234C205.839 92.8011 208.446 91 211.356 91H218.788C223.752 91 227.139 96.0236 225.277 100.625L201.168 160.216C200.098 162.861 197.531 164.591 194.679 164.591H181.076C178.123 164.591 175.488 162.738 174.489 159.959L165.226 134.188C162.984 127.953 154.139 128.032 152.01 134.306L143.344 159.841Z" style={{ fill: 'var(--color-surface-2)' }}/>
                                        </svg>
                                        <span className="text-sm font-normal text-text-1 tracking-tight">WealthVue</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-surface border border-border rounded-full px-2.5 py-0.5 text-[9px] font-normal text-text-3">ZAR</div>
                                        <div className="w-6 h-6 bg-surface-3 rounded-full" />
                                    </div>
                                </div>

                                {/* Mockup content */}
                                <div className="p-5 space-y-5">

                                    {/* NAV header + period pills */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-normal text-text-3 uppercase tracking-[0.2em] mb-1.5">Total Net Worth</p>
                                            <div className="flex items-end gap-2.5 flex-wrap">
                                                <p className="text-[1.9rem] font-normal tabular-nums leading-none">R 6,421,380</p>
                                                <p className="text-[10px] font-normal text-positive pb-0.5">↑ +R 78,420 · +1.23%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5 mt-1 shrink-0 bg-surface-2/60 border border-border rounded-full p-0.5">
                                            {["1W", "1M", "3M", "All"].map(p => (
                                                <div key={p} className={cn(
                                                    "px-2.5 py-1 rounded-full text-[9px] font-normal",
                                                    p === "1M" ? "bg-surface text-text-1" : "text-text-3"
                                                )}>{p}</div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Performance chart */}
                                    <div>
                                        <p className="text-[9px] font-normal text-text-3 uppercase tracking-[0.15em] mb-2">Performance</p>
                                        <div className="h-16">
                                            <svg viewBox="0 0 500 64" className="w-full h-full" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="productGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0.2 }} />
                                                        <stop offset="100%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0 }} />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M0,55 C50,52 100,44 150,36 C190,30 220,40 265,30 C310,20 345,13 400,9 C440,6 470,4 500,3" fill="none" style={{ stroke: 'var(--color-accent)' }} strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M0,55 C50,52 100,44 150,36 C190,30 220,40 265,30 C310,20 345,13 400,9 C440,6 470,4 500,3 V64 H0 Z" fill="url(#productGrad)" />
                                            </svg>
                                        </div>
                                        <div className="flex justify-between text-[8px] text-text-3 mt-1.5">
                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(m => <span key={m}>{m}</span>)}
                                        </div>
                                    </div>

                                    {/* Allocation + Portfolio Profile */}
                                    <div className="grid grid-cols-5 gap-3">
                                        {/* Allocation */}
                                        <div className="col-span-3 bg-surface-2/50 rounded-xl p-3 space-y-2.5">
                                            <p className="text-[9px] font-normal text-text-3 uppercase tracking-[0.15em]">Allocation</p>
                                            {[
                                                { label: "Stocks", pct: "42%", w: 0.9 },
                                                { label: "Crypto", pct: "31%", w: 0.68 },
                                                { label: "Property", pct: "14%", w: 0.46 },
                                                { label: "Vehicles", pct: "8%", w: 0.28 },
                                                { label: "Cash", pct: "5%", w: 0.14 },
                                            ].map((a) => (
                                                <div key={a.label}>
                                                    <div className="flex justify-between text-[9px] mb-1">
                                                        <span className="text-text-2">{a.label}</span>
                                                        <span className="text-text-1 tabular-nums">{a.pct}</span>
                                                    </div>
                                                    <div className="h-px bg-surface-3 rounded-full overflow-hidden">
                                                        <div className="h-full bg-text-1 rounded-full" style={{ width: a.pct, opacity: a.w }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Portfolio Profile */}
                                        <div className="col-span-2 bg-surface-2/50 rounded-xl p-3 space-y-3">
                                            <p className="text-[9px] font-normal text-text-3 uppercase tracking-[0.15em]">Profile</p>
                                            <div>
                                                <p className="text-[11px] font-normal text-text-1 leading-tight">The Market Bull</p>
                                                <p className="text-[9px] text-text-3 italic mt-0.5">Equity-heavy growth</p>
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    { label: "Risk", level: 2 },
                                                    { label: "Diversity", level: 1 },
                                                    { label: "Liquidity", level: 1 },
                                                ].map(item => (
                                                    <div key={item.label} className="flex items-center gap-2">
                                                        <span className="text-[8px] text-text-3 w-11 shrink-0">{item.label}</span>
                                                        <div className="flex gap-0.5 flex-1">
                                                            {[0, 1, 2].map(i => (
                                                                <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= item.level ? 'var(--color-accent)' : 'var(--color-surface-3)' }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* My Assets */}
                                    <div>
                                        {/* Toolbar */}
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[9px] font-normal text-text-3 uppercase tracking-[0.15em]">My Assets</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="bg-surface-2 border border-border rounded-full px-2 py-1 text-[8px] text-text-3 flex items-center gap-1">
                                                    <Search size={8} /><span>Search</span>
                                                </div>
                                                <div className="bg-surface-2 border border-border rounded-full px-2 py-1 text-[8px] text-text-3">High → Low</div>
                                            </div>
                                        </div>

                                        {/* Group header */}
                                        <div className="flex justify-between items-center px-2 py-1.5 bg-surface-2/60 rounded-lg mb-0.5 text-[8px] text-text-3 uppercase tracking-wider">
                                            <span>Stocks</span>
                                            <span className="tabular-nums text-text-2">R 268,600</span>
                                        </div>

                                        {/* Asset rows */}
                                        <div className="divide-y divide-border">
                                            {([
                                                { name: "Apple Inc", note: "24 shares · R 3,594/sh", value: "R 86,200", alloc: "1.3%", source: "Live", up: true, change: "+1.8%" },
                                                { name: "Bitcoin", note: "0.45 BTC", value: "R 534,100", alloc: "8.3%", source: "Live", up: true, change: "+4.3%" },
                                                { name: "Cape Town Apt", note: "Property · AI-estimated", value: "R 2,800,000", alloc: "43.6%", source: "AI Est.", up: null, change: null },
                                                { name: "Tesla", note: "10 shares · R 18,240/sh", value: "R 182,400", alloc: "2.8%", source: "Live", up: false, change: "−0.8%" },
                                            ] as Array<{ name: string; note: string; value: string; alloc: string; source: string; up: boolean | null; change: string | null }>).map(row => (
                                                <div key={row.name} className="flex items-center justify-between py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 bg-surface-2 rounded-lg flex items-center justify-center text-[9px] font-normal text-text-2 shrink-0">
                                                            {row.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-normal text-text-1">{row.name}</p>
                                                            <p className="text-[9px] text-text-3">{row.note}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "text-[8px] px-1.5 py-0.5 rounded-full",
                                                            row.source === "Live" ? "bg-positive/10 text-positive" : "text-accent"
                                                        )} style={row.source === "AI Est." ? { background: 'var(--color-accent-light)' } : {}}>
                                                            {row.source}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[11px] font-normal tabular-nums text-text-1">{row.value}</p>
                                                            <p className={cn("text-[9px] tabular-nums", row.change ? (row.up ? "text-positive" : "text-negative") : "text-text-3")}>
                                                                {row.change ?? row.alloc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                </section>

                {/* ── WHAT YOU CAN TRACK ── */}
                <section className="py-32 px-6 border-t border-border">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="mb-16 fade-up">
                            <p className="text-[10px] font-normal tracking-[0.22em] text-accent uppercase mb-5">What you can track</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-text-1">
                                If you own it,{" "}
                                <span className="text-accent italic">we can value it.</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { i: <LineChart size={18} />, t: "Stocks & ETFs", b: "Live prices from any exchange. Just enter the ticker." },
                                { i: <Coins size={18} />, t: "Crypto", b: "Bitcoin, Ethereum, Solana and thousands more via live market data." },
                                { i: <Car size={18} />, t: "Vehicles", b: "Make, model, year, mileage — AI estimates current resale value." },
                                { i: <Home size={18} />, t: "Property", b: "Manual or AI-assisted valuation for homes and investment property." },
                                { i: <Wallet size={18} />, t: "Cash & Savings", b: "Bank accounts, fixed deposits, and foreign currency holdings." },
                                { i: <MoreHorizontal size={18} />, t: "Anything else", b: "A watch collection. Art. A business. If you can describe it, we'll value it." },
                            ].map((item, i) => (
                                <div
                                    key={item.t}
                                    className="bg-surface p-7 rounded-2xl fade-up"
                                    style={{ transitionDelay: `${i * 40}ms` }}
                                >
                                    <div className="w-8 h-8 bg-surface-2 rounded-lg flex items-center justify-center text-accent mb-5">
                                        {item.i}
                                    </div>
                                    <h3 className="font-serif text-base text-text-1 mb-2">{item.t}</h3>
                                    <p className="text-sm text-text-2 leading-relaxed">{item.b}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section className="py-32 px-6 border-t border-border">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="mb-16 text-center fade-up">
                            <p className="text-[10px] font-normal tracking-[0.22em] text-accent uppercase mb-5">Pricing</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-text-1 mb-4">
                                Simple. Honest.{" "}
                                <span className="text-accent italic">Affordable.</span>
                            </h2>
                            <p className="text-base text-text-2">Start free. Upgrade when you're ready.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 max-w-[760px] mx-auto">
                            {/* Free Trial */}
                            <div className="bg-surface p-10 rounded-2xl flex flex-col fade-up">
                                <div className="mb-8">
                                    <h3 className="font-serif text-xl text-text-1 mb-3">Free Trial</h3>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-serif text-text-1">$0</span>
                                        <span className="text-text-3 text-sm">for 30 days</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {[
                                        "Full portfolio & net worth tracking",
                                        "Multi-currency & FX support",
                                        "Financial goal tracking",
                                        "Net worth history (30 days)",
                                        "10 AI credits — one-time"
                                    ].map(f => (
                                        <li key={f} className="flex items-start gap-3 text-sm text-text-2">
                                            <Check size={13} className="text-text-3 shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={onTryDemo}
                                    className="w-full border border-border text-text-1 py-3 rounded-full text-sm font-normal hover:bg-surface-2 transition-colors"
                                >
                                    Start Free Trial
                                </button>
                            </div>

                            {/* Pro */}
                            <div
                                className="bg-surface-2 p-10 rounded-2xl border border-accent/25 flex flex-col relative fade-up"
                                style={{ transitionDelay: "80ms" }}
                            >
                                <div className="absolute top-5 right-5">
                                    <span className="text-[9px] font-normal tracking-[0.15em] text-accent uppercase bg-accent/10 px-2.5 py-1 rounded-full">
                                        Popular
                                    </span>
                                </div>
                                <div className="mb-8">
                                    <h3 className="font-serif text-xl text-text-1 mb-3">Pro</h3>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-serif text-text-1">$5</span>
                                        <span className="text-text-3 text-sm">per month</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {[
                                        "Everything in Trial, forever",
                                        "50 AI credits / month — renewed monthly",
                                        "Unlimited net worth history",
                                        "Priority support",
                                        "Export to CSV"
                                    ].map(f => (
                                        <li key={f} className="flex items-start gap-3 text-sm text-text-2">
                                            <Check size={13} className="text-accent shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => {
                                        if (!user) { onSignIn(); return; }
                                        if (user.plan === "pro") { navigate("/app"); return; }
                                        import("../../services/paddleService").then(({ openCheckout }) => {
                                            openCheckout(user.email, firebaseUid ?? user.email);
                                        });
                                    }}
                                    className="w-full bg-accent text-on-accent py-3 rounded-full text-sm font-normal hover:opacity-90 transition-all"
                                >
                                    Get Started
                                </button>
                                <p className="text-center text-[10px] text-text-3 mt-3">Billed monthly. Cancel anytime.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ── */}
                <section className="py-40 px-6 text-center border-t border-border overflow-hidden">
                    <div className="max-w-[1120px] mx-auto fade-up">
                        <h2 className="text-[3.5rem] sm:text-6xl md:text-8xl lg:text-[7.5rem] font-serif leading-[1.02] text-text-1 mb-12">
                            Know your{" "}
                            <span className="text-accent italic">number.</span>
                        </h2>
                        <div className="space-y-4">
                            <button
                                onClick={onTryDemo}
                                className="btn-primary px-10 py-4 text-base"
                            >
                                Try WealthVue Free
                            </button>
                            <p className="text-xs text-text-3">30-day free trial · No credit card · Cancel anytime</p>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
};
