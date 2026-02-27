import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    Briefcase,
    Coins,
    Car,
    Home,
    Wallet,
    MoreHorizontal,
    Check,
    Upload,
    Search,
    User as UserIcon
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface LandingPageProps {
    onSignIn: () => void;
    onTryDemo: () => void;
}

export const LandingPage = ({ onSignIn, onTryDemo }: LandingPageProps) => {
    useScrollReveal();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-bg text-text-1 selection:bg-accent/20">
            {/* Navigation */}
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                isScrolled ? "bg-surface/80 backdrop-blur-md border-b border-border py-3" : "bg-transparent"
            )}>
                <div className="max-w-[1120px] mx-auto flex justify-between items-center">
                    <div className="text-2xl font-serif text-accent font-semibold">WealthVue</div>
                    <div className="flex items-center gap-6">
                        <button onClick={onSignIn} className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors">Sign In</button>
                        <button onClick={onTryDemo} className="bg-accent text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all">Try Free</button>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="min-h-screen flex items-center pt-20 px-6 overflow-hidden">
                    <div className="max-w-[1120px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-xs font-bold tracking-[0.2em] text-accent uppercase"
                            >
                                AI-POWERED WEALTH TRACKING
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-5xl md:text-7xl font-serif leading-[1.1] text-text-1"
                            >
                                Every asset.<br />One clear<br />picture.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-xl text-text-2 max-w-[480px] leading-relaxed"
                            >
                                WealthVue connects your stocks, crypto, property, vehicles, and cash into a single net worth dashboard. Just upload a screenshot or type a description — AI does the rest.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-wrap gap-6 items-center"
                            >
                                <button onClick={onTryDemo} className="bg-accent text-white px-8 py-4 rounded-full text-lg font-medium hover:opacity-90 hover:shadow-lg transition-all">
                                    Try it Free
                                </button>
                                <a href="#how-it-works" className="text-text-2 hover:text-text-1 underline underline-offset-4 transition-colors">
                                    See how it works ↓
                                </a>
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="text-sm text-text-3"
                            >
                                No credit card required · 30-day free trial · Cancel anytime
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 1 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="absolute -inset-20 bg-accent-light/50 rounded-full blur-3xl -z-10" />
                            <div className="bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden animate-float">
                                {/* Mockup Top Bar */}
                                <div className="bg-surface-2/50 border-b border-border p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-accent rounded flex items-center justify-center text-[10px] text-white font-bold">W</div>
                                        <span className="text-xs font-serif font-semibold text-accent">WealthVue</span>
                                    </div>
                                    <div className="bg-white border border-border rounded px-2 py-0.5 text-[10px] font-medium text-text-2">USD</div>
                                </div>
                                {/* Mockup Content */}
                                <div className="p-6 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-1">Total Net Worth</p>
                                        <p className="text-3xl font-medium tabular-nums">$347,820.14</p>
                                        <p className="text-[11px] font-medium text-positive mt-1">+$4,210.33 (+1.23%) today</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-surface-2/30 rounded-xl p-4 border border-border/50">
                                            <div className="w-20 h-20 mx-auto rounded-full" style={{ background: 'conic-gradient(#C96442 0% 42%, #4A7C59 42% 73%, #6B6560 73% 87%, #EDE9E3 87% 100%)' }} />
                                            <div className="mt-3 space-y-1">
                                                <div className="flex justify-between text-[8px] uppercase font-bold text-text-3">
                                                    <span>Stocks 42%</span>
                                                    <span>Crypto 31%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-surface-2/30 rounded-xl p-4 border border-border/50 flex flex-col justify-end">
                                            <svg viewBox="0 0 100 40" className="w-full h-12">
                                                <path d="M0,35 Q20,30 40,20 T80,10 T100,5" fill="none" stroke="#C96442" strokeWidth="2" />
                                                <path d="M0,35 Q20,30 40,20 T80,10 T100,5 V40 H0 Z" fill="url(#grad)" opacity="0.1" />
                                                <defs>
                                                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#C96442" />
                                                        <stop offset="100%" stopColor="transparent" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { t: 'AAPL', n: 'Apple Inc', q: '24 shares', p: '$189.50', v: '$4,548.00' },
                                            { t: 'BTC', n: 'Bitcoin', q: '0.45 BTC', p: '$62,400', v: '$28,080.00' }
                                        ].map(row => (
                                            <div key={row.t} className="flex items-center justify-between text-[10px] py-2 border-b border-border/30 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 bg-surface-2 rounded flex items-center justify-center font-bold text-text-2">{row.t[0]}</div>
                                                    <div>
                                                        <p className="font-bold">{row.t}</p>
                                                        <p className="text-text-3">{row.n}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold tabular-nums">{row.v}</p>
                                                    <p className="text-text-3">{row.q} @ {row.p}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Social Proof Bar */}
                <section className="bg-surface-2 py-4 border-y border-border overflow-hidden">
                    <div className="max-w-[1120px] mx-auto px-6 text-center">
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.3em]">
                            Track stocks · crypto · vehicles · property · cash · anything
                        </p>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-32 px-6">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="max-w-xl mb-20 fade-up">
                            <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-4">HOW IT WORKS</p>
                            <h2 className="text-4xl md:text-5xl font-serif mb-6">From screenshot to net worth in seconds.</h2>
                            <p className="text-lg text-text-2">
                                No manual data entry. No API keys. No linking bank accounts. Just describe what you own — or show us a screenshot — and WealthVue handles the rest.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    id: '01',
                                    t: 'Upload or describe',
                                    b: "Take a screenshot of your Robinhood account, type '2020 VW Polo 50k km', or just say 'I have 0.5 Bitcoin'. Any format works."
                                },
                                {
                                    id: '02',
                                    t: 'AI does the valuation',
                                    b: "Gemini AI reads your input, identifies the asset, and pulls live market data or estimates the value using current market knowledge. Stocks, crypto, and cars all handled automatically."
                                },
                                {
                                    id: '03',
                                    t: 'Watch your wealth grow',
                                    b: "Your net worth updates in your display currency of choice. Every asset tracked. Every currency supported. One clean number."
                                }
                            ].map((step, i) => (
                                <div key={step.id} className="bg-surface p-10 rounded-2xl border border-border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
                                    <div className="text-5xl font-serif font-light text-accent/30 mb-8">{step.id}</div>
                                    <h3 className="text-xl font-medium mb-4">{step.t}</h3>
                                    <p className="text-text-2 text-sm leading-relaxed">{step.b}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Asset Types Grid */}
                <section className="py-32 px-6 bg-surface-2/30">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-20 fade-up">
                            <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-4">WHAT YOU CAN TRACK</p>
                            <h2 className="text-4xl md:text-5xl font-serif">If you own it, WealthVue can value it.</h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { i: <Briefcase size={24} />, t: 'Stocks & ETFs', b: 'Live prices from any exchange. Just enter the ticker.' },
                                { i: <Coins size={24} />, t: 'Crypto', b: 'Bitcoin, Ethereum, Solana and thousands more via live market data.' },
                                { i: <Car size={24} />, t: 'Vehicles', b: 'Describe your car — make, model, year, mileage — and AI estimates its current resale value.' },
                                { i: <Home size={24} />, t: 'Property', b: 'Add your home or investment property with a manual or AI-assisted value.' },
                                { i: <Wallet size={24} />, t: 'Cash & Savings', b: 'Bank accounts, fixed deposits, and foreign currency holdings.' },
                                { i: <MoreHorizontal size={24} />, t: 'Anything else', b: 'A watch collection. Art. A business. If you can describe it, WealthVue will try to value it.' }
                            ].map((item, i) => (
                                <div key={item.t} className="bg-surface-2/50 p-8 rounded-2xl border border-border/50 hover:bg-surface transition-all duration-300 fade-up" style={{ transitionDelay: `${i * 50}ms` }}>
                                    <div className="text-accent mb-6">{item.i}</div>
                                    <h3 className="text-lg font-medium mb-2">{item.t}</h3>
                                    <p className="text-text-2 text-sm">{item.b}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Differentiator */}
                <section className="py-32 px-6 bg-surface-2">
                    <div className="max-w-[1120px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8 fade-up">
                            <h2 className="text-4xl font-serif italic leading-tight text-text-1">
                                "Your wealth isn't just on Robinhood.<br />It shouldn't only be tracked there."
                            </h2>
                            <p className="text-lg text-text-2 leading-relaxed">
                                Most portfolio tools only see what they can connect to. WealthVue works differently — you bring the data, however it exists. A screenshot from any app. A sentence describing your car. A number you type in. No integrations required. No platform lock-in.
                            </p>
                        </div>
                        <div className="space-y-4 fade-up">
                            <div className="bg-surface p-6 rounded-xl border-l-4 border-accent shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Upload size={16} className="text-accent" />
                                    <span className="text-xs font-bold text-text-3 uppercase tracking-wider">Screenshot</span>
                                </div>
                                <div className="bg-surface-2 p-3 rounded text-[10px] font-medium flex justify-between">
                                    <span>TSLA · 10 shares</span>
                                    <span>$241.50</span>
                                </div>
                            </div>
                            <div className="bg-surface p-6 rounded-xl border-l-4 border-accent shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Search size={16} className="text-accent" />
                                    <span className="text-xs font-bold text-text-3 uppercase tracking-wider">Plain text</span>
                                </div>
                                <div className="bg-bg p-3 rounded text-xs italic text-text-2 mb-2">
                                    "2021 Tesla Model 3, ~35k miles, good condition"
                                </div>
                                <div className="bg-accent-light text-accent px-3 py-1.5 rounded-full text-[10px] font-bold inline-flex items-center gap-2">
                                    ✦ Estimated value: $27,400 USD
                                </div>
                            </div>
                            <div className="bg-surface p-6 rounded-xl border-l-4 border-accent shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <UserIcon size={16} className="text-accent" />
                                    <span className="text-xs font-bold text-text-3 uppercase tracking-wider">Manual entry</span>
                                </div>
                                <div className="text-sm font-medium">FNB Savings — R 142,000</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="py-32 px-6">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-20 fade-up">
                            <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-4">PRICING</p>
                            <h2 className="text-4xl md:text-5xl font-serif mb-6">Simple. Honest. Affordable.</h2>
                            <p className="text-lg text-text-2">Start free. Upgrade when you're ready. No surprises.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
                            <div className="bg-surface p-10 rounded-2xl border border-border shadow-sm flex flex-col fade-up">
                                <div className="mb-8">
                                    <h3 className="text-xl font-medium mb-2">Free Trial</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-serif">$0</span>
                                        <span className="text-text-3 text-sm">for 30 days</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {['All features included', 'Add unlimited assets', 'AI-powered valuation', 'Live price refresh', 'Multi-currency display', 'No credit card required'].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-text-2">
                                            <Check size={16} className="text-positive" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={onTryDemo} className="w-full border border-accent text-accent py-3 rounded-full font-medium hover:bg-accent-light transition-colors">
                                    Start Free Trial
                                </button>
                            </div>

                            <div className="bg-surface p-10 rounded-2xl border border-accent shadow-xl flex flex-col relative fade-up">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-xl font-medium mb-2">Pro</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-serif">$4</span>
                                        <span className="text-text-3 text-sm">per month</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {['Everything in Free Trial', 'Continued full access', 'Priority support', 'Early access to new features'].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-text-2">
                                            <Check size={16} className="text-positive" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={onSignIn} className="w-full bg-accent text-white py-3 rounded-full font-medium hover:opacity-90 transition-all">
                                    Get Started
                                </button>
                                <p className="text-center text-[10px] text-text-3 mt-4">Billed monthly. Cancel anytime.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-text-1 py-32 px-6 text-center overflow-hidden">
                    <div className="max-w-[1120px] mx-auto space-y-10 fade-up">
                        <h2 className="text-5xl md:text-7xl font-serif text-white">Know your number.</h2>
                        <p className="text-lg text-white/60 max-w-[480px] mx-auto leading-relaxed">
                            Most people have no idea what they're actually worth. WealthVue gives you that number — across every asset, every platform, every currency — updated every time you open it.
                        </p>
                        <div className="space-y-4">
                            <button onClick={onTryDemo} className="bg-white text-text-1 px-10 py-4 rounded-full text-lg font-medium hover:scale-[1.02] hover:shadow-xl transition-all">
                                Try WealthVue Free
                            </button>
                            <p className="text-xs text-white/40">30-day free trial · No credit card · Cancel anytime</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface-2 py-20 px-6 border-t border-border">
                <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div>
                        <div className="text-2xl font-serif text-accent font-semibold mb-2">WealthVue</div>
                        <p className="text-sm text-text-3">Your entire wealth, one beautiful view.</p>
                    </div>
                    <div className="flex gap-8 text-sm text-text-3">
                        <a href="#" className="hover:text-text-1 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-text-1 transition-colors">Terms of Service</a>
                    </div>
                </div>
                <div className="max-w-[1120px] mx-auto mt-20 pt-8 border-t border-border/50 text-center">
                    <p className="text-xs text-text-3">© 2025 WealthVue. Built with ♥ and AI.</p>
                </div>
            </footer>
        </div>
    );
};
