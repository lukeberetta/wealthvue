import React from "react";
import { motion } from "motion/react";
import {
    LineChart, Coins, Car, Home, Wallet, MoreHorizontal,
    Check, Upload, Search, User as UserIcon, ArrowRight
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { AppNav } from "../../components/ui/AppNav";
import { Footer } from "../../components/ui/Footer";

interface LandingPageProps {
    user: import("../../types").User | null;
    isDemo?: boolean;
    onSignIn: () => void;
    onTryDemo: () => void;
    onSignOut?: () => void;
}

export const LandingPage = ({ user, isDemo = false, onSignIn, onTryDemo, onSignOut }: LandingPageProps) => {
    useScrollReveal();

    return (
        <div className="min-h-screen bg-bg text-text-1 selection:bg-accent/20">

            <AppNav
                user={user}
                isDemo={isDemo}
                onSignIn={onSignIn}
                onTryDemo={onTryDemo}
                onSignOut={onSignOut}
            />

            <main>
                {/* ── HERO ── */}
                <section className="min-h-screen flex items-center pt-20 px-6 overflow-hidden">
                    <div className="max-w-[1120px] mx-auto grid lg:grid-cols-2 gap-20 items-center w-full">

                        {/* Left: copy */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase"
                            >
                                AI-Powered Wealth Tracking
                            </motion.div>

                            {/* ── HEADLINE: brand signature — last phrase in accent ── */}
                            <motion.h1
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-5xl md:text-[4.5rem] font-serif leading-[1.08] text-text-1"
                            >
                                Every asset.<br />
                                One clear<br />
                                <span className="text-accent italic">picture.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg text-text-2 max-w-[440px] leading-relaxed"
                            >
                                WealthVue brings your stocks, crypto, property, vehicles, and cash into a single net worth dashboard. Upload a screenshot or type a description — AI handles the rest.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-wrap gap-4 items-center"
                            >
                                <button
                                    onClick={onTryDemo}
                                    className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base"
                                >
                                    Try it Free
                                    <ArrowRight size={17} />
                                </button>
                                <a
                                    href="#how-it-works"
                                    className="text-sm text-text-3 hover:text-text-1 transition-colors underline underline-offset-4"
                                >
                                    See how it works
                                </a>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.45 }}
                                className="text-xs text-text-3"
                            >
                                No credit card required · 30-day free trial · Cancel anytime
                            </motion.p>
                        </div>

                        {/* Right: dashboard mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="relative hidden lg:block"
                        >
                            {/* Warm glow behind the card */}
                            <div className="absolute -inset-16 bg-accent/6 rounded-full blur-3xl -z-10" />
                            <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-float shadow-2xl">
                                {/* Mockup nav */}
                                <div className="bg-surface-2/50 border-b border-border px-5 py-3.5 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-accent rounded flex items-center justify-center text-[10px] text-white font-bold">W</div>
                                        <span className="text-sm font-serif font-semibold text-accent">WealthVue</span>
                                    </div>
                                    <div className="bg-surface border border-border rounded-full px-3 py-0.5 text-[10px] font-bold text-text-3">ZAR</div>
                                </div>
                                {/* Mockup content */}
                                <div className="p-6 space-y-6">
                                    <div>
                                        <p className="text-[9px] font-bold text-text-3 uppercase tracking-[0.2em] mb-1.5">Total Net Worth</p>
                                        <p className="text-3xl font-serif tabular-nums">R 6,421,380</p>
                                        <p className="text-[11px] text-positive mt-1.5 font-medium">+R 78,420 (+1.23%) today</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-surface-2/40 rounded-xl p-4 border border-border/60">
                                            {/* Mini donut */}
                                            <div className="w-16 h-16 mx-auto rounded-full" style={{ background: "conic-gradient(#C96442 0% 42%, #5D8F6E 42% 73%, #6B6258 73% 87%, #38312A 87% 100%)" }} />
                                            <div className="mt-2.5 space-y-0.5">
                                                <div className="flex justify-between text-[8px] font-bold text-text-3 uppercase">
                                                    <span>Stocks 42%</span><span>Crypto 31%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-surface-2/40 rounded-xl p-4 border border-border/60 flex flex-col justify-end">
                                            <svg viewBox="0 0 100 40" className="w-full h-10">
                                                <defs>
                                                    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#C96442" stopOpacity="0.3" />
                                                        <stop offset="100%" stopColor="#C96442" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M0,35 Q25,28 45,18 T85,8 T100,4" fill="none" stroke="#C96442" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M0,35 Q25,28 45,18 T85,8 T100,4 V40 H0 Z" fill="url(#heroGrad)" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { t: "AAPL", n: "Apple Inc", q: "24 shares", v: "R 86,200" },
                                            { t: "BTC", n: "Bitcoin", q: "0.45 BTC", v: "R 534,100" },
                                        ].map(row => (
                                            <div key={row.t} className="flex items-center justify-between text-[10px] py-2 border-b border-border/40 last:border-0">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-6 h-6 bg-surface-2 rounded-lg flex items-center justify-center font-bold text-text-2 text-[8px]">{row.t[0]}</div>
                                                    <div>
                                                        <p className="font-bold text-text-1">{row.t}</p>
                                                        <p className="text-text-3">{row.n}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold tabular-nums text-text-1">{row.v}</p>
                                                    <p className="text-text-3">{row.q}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── TICKER BAR ── */}
                <section className="bg-surface-2/60 py-3.5 border-y border-border">
                    <div className="max-w-[1120px] mx-auto px-6 text-center">
                        <p className="text-[9px] font-bold text-text-3 uppercase tracking-[0.35em]">
                            Track stocks · crypto · vehicles · property · cash · anything
                        </p>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section id="how-it-works" className="py-32 px-6">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="max-w-xl mb-20 fade-up">
                            <p className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase mb-4">How it works</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-text-1 mb-5">
                                From screenshot to<br />net worth in{" "}
                                <span className="text-accent italic">seconds.</span>
                            </h2>
                            <p className="text-lg text-text-2 leading-relaxed">
                                No manual data entry. No API keys. No linking bank accounts. Just describe what you own — or show us a screenshot — and WealthVue handles the rest.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    id: "01",
                                    t: "Upload or describe",
                                    b: "Screenshot of your Robinhood account, '2020 VW Polo 50k km', or '0.5 Bitcoin'. Any format works."
                                },
                                {
                                    id: "02",
                                    t: "AI does the valuation",
                                    b: "Gemini AI reads your input, identifies the asset, and pulls live market data. Stocks, crypto, and cars all handled automatically."
                                },
                                {
                                    id: "03",
                                    t: "Watch your wealth grow",
                                    b: "Net worth updates in your display currency of choice. Every asset tracked. Every currency supported. One clean number."
                                }
                            ].map((step, i) => (
                                <div
                                    key={step.id}
                                    className="bg-surface p-8 rounded-2xl border border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300 fade-up"
                                    style={{ transitionDelay: `${i * 80}ms` }}
                                >
                                    <div className="text-5xl font-serif font-light text-accent/25 mb-6">{step.id}</div>
                                    <h3 className="text-lg font-serif text-text-1 mb-3">{step.t}</h3>
                                    <p className="text-sm text-text-2 leading-relaxed">{step.b}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── ASSET TYPES ── */}
                <section className="py-32 px-6 bg-surface-2/20 border-y border-border">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-20 fade-up">
                            <p className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase mb-4">What you can track</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-text-1">
                                If you own it,{" "}
                                <span className="text-accent italic">WealthVue can value it.</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { i: <LineChart size={22} />, t: "Stocks & ETFs", b: "Live prices from any exchange. Just enter the ticker." },
                                { i: <Coins size={22} />, t: "Crypto", b: "Bitcoin, Ethereum, Solana and thousands more via live market data." },
                                { i: <Car size={22} />, t: "Vehicles", b: "Make, model, year, mileage — AI estimates current resale value." },
                                { i: <Home size={22} />, t: "Property", b: "Manual or AI-assisted value for homes and investment property." },
                                { i: <Wallet size={22} />, t: "Cash & Savings", b: "Bank accounts, fixed deposits, and foreign currency holdings." },
                                { i: <MoreHorizontal size={22} />, t: "Anything else", b: "A watch collection. Art. A business. If you can describe it, we'll value it." },
                            ].map((item, i) => (
                                <div
                                    key={item.t}
                                    className="bg-surface p-7 rounded-2xl border border-border hover:border-accent/20 hover:bg-surface-2/40 transition-all duration-300 fade-up"
                                    style={{ transitionDelay: `${i * 50}ms` }}
                                >
                                    <div className="text-accent mb-5">{item.i}</div>
                                    <h3 className="font-serif text-lg text-text-1 mb-2">{item.t}</h3>
                                    <p className="text-sm text-text-2 leading-relaxed">{item.b}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── DIFFERENTIATOR ── */}
                <section className="py-32 px-6">
                    <div className="max-w-[1120px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-6 fade-up">
                            <h2 className="text-4xl font-serif italic leading-tight text-text-1">
                                "Your wealth isn't just on Robinhood.<br />
                                It shouldn't only be{" "}
                                <span className="text-accent">tracked there.</span>"
                            </h2>
                            <p className="text-lg text-text-2 leading-relaxed">
                                Most portfolio tools only see what they can connect to. WealthVue works differently — you bring the data, however it exists. A screenshot from any app. A sentence describing your car. A number you type in. No integrations required.
                            </p>
                        </div>
                        <div className="space-y-4 fade-up">
                            {[
                                {
                                    icon: <Upload size={15} className="text-accent" />,
                                    label: "Screenshot",
                                    preview: <div className="bg-surface-2 p-3 rounded-lg text-[10px] font-medium text-text-2 flex justify-between font-mono">
                                        <span>TSLA · 10 shares</span><span>$241.50</span>
                                    </div>
                                },
                                {
                                    icon: <Search size={15} className="text-accent" />,
                                    label: "Plain text",
                                    preview: <div className="space-y-2">
                                        <div className="bg-bg/60 px-3 py-2 rounded-lg text-xs italic text-text-2">"2021 Tesla Model 3, ~35k miles, good condition"</div>
                                        <div className="bg-accent-light text-accent px-3 py-1.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5">
                                            ✦ Estimated value: $27,400 USD
                                        </div>
                                    </div>
                                },
                                {
                                    icon: <UserIcon size={15} className="text-accent" />,
                                    label: "Manual entry",
                                    preview: <p className="text-sm font-medium text-text-1">FNB Savings — R 142,000</p>
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-surface p-5 rounded-2xl border-l-4 border-accent border border-border/50 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        {item.icon}
                                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    {item.preview}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section className="py-32 px-6 bg-surface-2/20 border-y border-border">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-20 fade-up">
                            <p className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase mb-4">Pricing</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-text-1 mb-4">
                                Simple. Honest.{" "}
                                <span className="text-accent italic">Affordable.</span>
                            </h2>
                            <p className="text-lg text-text-2">Start free. Upgrade when you're ready.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-[760px] mx-auto">
                            {/* Free */}
                            <div className="bg-surface p-10 rounded-2xl border border-border flex flex-col fade-up">
                                <div className="mb-8">
                                    <h3 className="font-serif text-xl text-text-1 mb-2">Free Trial</h3>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-serif text-text-1">$0</span>
                                        <span className="text-text-3 text-sm">for 30 days</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {["All features included", "Add unlimited assets", "AI-powered valuation", "Live price refresh", "Multi-currency display", "No credit card required"].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-text-2">
                                            <Check size={14} className="text-positive shrink-0" />{f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={onTryDemo} className="w-full border border-accent text-accent py-3 rounded-full text-sm font-medium hover:bg-accent-light transition-colors">
                                    Start Free Trial
                                </button>
                            </div>

                            {/* Pro */}
                            <div className="bg-surface p-10 rounded-2xl border border-accent shadow-xl shadow-accent/10 flex flex-col relative fade-up">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                                    Most Popular
                                </div>
                                <div className="mb-8">
                                    <h3 className="font-serif text-xl text-text-1 mb-2">Pro</h3>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-serif text-text-1">$4</span>
                                        <span className="text-text-3 text-sm">per month</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {["Everything in Free Trial", "Continued full access", "Priority support", "Early access to new features"].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-text-2">
                                            <Check size={14} className="text-positive shrink-0" />{f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={onSignIn} className="w-full bg-accent text-white py-3 rounded-full text-sm font-medium hover:opacity-88 transition-all">
                                    Get Started
                                </button>
                                <p className="text-center text-[10px] text-text-3 mt-3">Billed monthly. Cancel anytime.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ── */}
                <section className="py-32 px-6 text-center overflow-hidden bg-surface-2/30">
                    <div className="max-w-[1120px] mx-auto space-y-8 fade-up">
                        <h2 className="text-5xl md:text-7xl font-serif text-text-1">
                            Know your{" "}
                            <span className="text-accent italic">number.</span>
                        </h2>
                        <p className="text-lg text-text-2 max-w-[440px] mx-auto leading-relaxed">
                            Most people have no idea what they're actually worth. WealthVue gives you that number — across every asset, every platform, every currency.
                        </p>
                        <div className="space-y-3">
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
