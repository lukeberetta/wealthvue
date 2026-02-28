import React from "react";
import { ArrowLeft, CreditCard, Trash2, LogOut, Palette, ChevronDown } from "lucide-react";
import { User } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { cn, getInitials, avatarPalette } from "../../lib/utils";

interface SettingsViewProps {
    user: User | null;
    onSignOut: () => void;
    onBack: () => void;
    onUpdateUser: (user: User) => void;
}

export const SettingsView = ({ user, onSignOut, onBack, onUpdateUser }: SettingsViewProps) => {
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (user) onUpdateUser({ ...user, defaultCurrency: e.target.value });
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (user) onUpdateUser({ ...user, country: e.target.value });
    };

    const SUPPORTED_COUNTRIES = [
        { code: "US", name: "United States" },
        { code: "ZA", name: "South Africa" },
        { code: "GB", name: "United Kingdom" },
        { code: "AU", name: "Australia" },
        { code: "CA", name: "Canada" },
        { code: "EU", name: "European Union" },
    ];

    return (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <h2 className="font-serif text-3xl text-text-1">Settings</h2>
            </div>

            {/* Profile */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-[0.18em]">Profile</h3>
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0",
                            user?.displayName ? avatarPalette(user.displayName) : "bg-surface-2 text-text-3"
                        )}>
                            {user?.displayName ? getInitials(user.displayName) : ""}
                        </div>
                        <div>
                            <p className="font-medium text-text-1">{user?.displayName}</p>
                            <p className="text-sm text-text-3">{user?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-3 tracking-wider">Display Name</label>
                            <input
                                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                                defaultValue={user?.displayName}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-3 tracking-wider">Default Currency</label>
                            <div className="relative">
                                <select
                                    className="appearance-none w-full bg-surface-2 border border-border rounded-xl px-3 py-2 pr-10 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    defaultValue={user?.defaultCurrency}
                                    onChange={handleCurrencyChange}
                                >
                                    <option value="USD">USD – US Dollar</option>
                                    <option value="ZAR">ZAR – SA Rand</option>
                                    <option value="EUR">EUR – Euro</option>
                                    <option value="GBP">GBP – British Pound</option>
                                    <option value="AUD">AUD – Australian Dollar</option>
                                    <option value="CAD">CAD – Canadian Dollar</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={16} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-3 tracking-wider">Country Location</label>
                            <div className="relative">
                                <select
                                    className="appearance-none w-full bg-surface-2 border border-border rounded-xl px-3 py-2 pr-10 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    defaultValue={user?.country || "ZA"}
                                    onChange={handleCountryChange}
                                >
                                    {SUPPORTED_COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={16} />
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Appearance */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-[0.18em]">Appearance</h3>
                <Card className="p-6">
                    <div className="flex items-start justify-between gap-8">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center text-accent shrink-0 mt-0.5">
                                <Palette size={17} />
                            </div>
                            <div>
                                <p className="font-medium text-text-1 text-sm">Theme</p>
                                <p className="text-xs text-text-3 mt-0.5 leading-relaxed max-w-xs">
                                    Dark mode is the native WealthVue experience. Light follows the same warm palette in daylight. Device respects your OS setting.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 pt-0.5">
                            <ThemeToggle variant="labeled" />
                        </div>
                    </div>
                </Card>
            </section>

            {/* Plan & Billing */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-[0.18em]">Plan & Billing</h3>
                <Card className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-accent-light rounded-xl flex items-center justify-center text-accent">
                            <CreditCard size={17} />
                        </div>
                        <div>
                            <p className="font-medium text-text-1 text-sm capitalize">{user?.plan} Plan</p>
                            <p className="text-xs text-text-3">Your trial ends in 18 days.</p>
                        </div>
                    </div>
                    <Button variant="secondary" className="text-sm rounded-full px-5 py-2">Upgrade to Pro</Button>
                </Card>
            </section>

            {/* Danger Zone */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-negative uppercase tracking-[0.18em]">Danger Zone</h3>
                <Card className="p-6 border-negative/20 bg-negative/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-negative text-sm">Delete Account</p>
                            <p className="text-xs text-text-3 mt-0.5">Permanently removes all your data and assets.</p>
                        </div>
                        <Button variant="ghost" className="text-negative hover:bg-negative/10 flex items-center gap-2 text-sm">
                            <Trash2 size={15} />
                            Delete
                        </Button>
                    </div>
                </Card>
            </section>

            <div className="flex justify-center pt-4">
                <Button variant="ghost" onClick={onSignOut} className="text-text-3 flex items-center gap-2 text-sm hover:text-negative">
                    <LogOut size={15} />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};
