import React, { useState } from "react";
import { useToast } from "../../components/ui/Toast";
import { ArrowLeft, CreditCard, Trash2, LogOut, Palette, ChevronDown, AlertTriangle } from "lucide-react";
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
    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { addToast } = useToast();

    const trialDaysRemaining = user?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (user) {
            onUpdateUser({ ...user, displayName, defaultCurrency: e.target.value });
            addToast(`Currency changed to ${e.target.value}`);
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (user) {
            onUpdateUser({ ...user, displayName, country: e.target.value });
            addToast("Country updated");
        }
    };

    const handleDisplayNameBlur = () => {
        if (user && displayName !== user.displayName) {
            onUpdateUser({ ...user, displayName });
            addToast("Name saved");
        }
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
        <div className="max-w-2xl mx-auto w-full py-10 space-y-10">
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
                            displayName ? avatarPalette(displayName) : "bg-surface-2 text-text-3"
                        )}>
                            {displayName ? getInitials(displayName) : ""}
                        </div>
                        <div>
                            <p className="font-medium text-text-1">{displayName || user?.displayName}</p>
                            <p className="text-sm text-text-3">{user?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-3 tracking-wider">Display Name</label>
                            <input
                                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                onBlur={handleDisplayNameBlur}
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
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
                        <div className="shrink-0 sm:pt-0.5">
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
                            {user?.plan === "trial" && trialDaysRemaining !== null && (
                                <p className="text-xs text-text-3">
                                    {trialDaysRemaining > 0
                                        ? `Your trial ends in ${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"}.`
                                        : "Your trial has ended."}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button variant="secondary" className="text-sm rounded-full px-5 py-2">Upgrade to Pro</Button>
                </Card>
            </section>

            {/* Danger Zone */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-negative uppercase tracking-[0.18em]">Danger Zone</h3>
                <Card className="p-6 border-negative/20 bg-negative/5">
                    {!showDeleteConfirm ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-negative text-sm">Delete Account</p>
                                <p className="text-xs text-text-3 mt-0.5">Permanently removes all your data and assets.</p>
                            </div>
                            <Button variant="ghost" className="text-negative hover:bg-negative/10 flex items-center gap-2 text-sm" onClick={() => setShowDeleteConfirm(true)}>
                                <Trash2 size={15} />
                                Delete
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="text-negative shrink-0 mt-0.5" size={16} />
                                <div>
                                    <p className="font-medium text-negative text-sm">Are you sure?</p>
                                    <p className="text-xs text-text-3 mt-0.5 leading-relaxed">This will sign you out and your account data will be permanently deleted. This cannot be undone.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" className="text-sm px-4 py-2 rounded-xl" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button variant="ghost" className="text-negative hover:bg-negative/10 text-sm px-4 py-2 rounded-xl" onClick={onSignOut}>
                                    Yes, delete my account
                                </Button>
                            </div>
                        </div>
                    )}
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
