import React from "react";
import { X, Zap, Check } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { openCheckout } from "../../services/paddleService";
import { useAuth } from "../../contexts/AuthContext";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TRIAL_FEATURES = [
    "Full portfolio & net worth tracking",
    "Multi-currency & FX support",
    "Financial goal tracking",
    "Net worth history (30 days)",
    "10 AI credits — one-time",
];

const PRO_FEATURES = [
    "Everything in Trial, forever",
    "50 AI credits / month — renewed monthly",
    "Unlimited net worth history",
    "Priority support",
    "Export to CSV",
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { user, firebaseUser } = useAuth();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        if (user && firebaseUser) {
            openCheckout(user.email, firebaseUser.uid);
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
                            <Zap size={15} />
                        </div>
                        <h2 className="font-serif text-xl text-text-1">Upgrade to Pro</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Cards */}
                <div className="p-6 grid grid-cols-2 gap-5">
                    {/* Trial card */}
                    <div className="bg-surface-2 p-8 rounded-2xl border border-border flex flex-col">
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3">Free Trial</p>
                        <div className="flex items-end gap-1.5 mb-1">
                            <span className="text-4xl font-serif text-text-1">$0</span>
                        </div>
                        <p className="text-xs text-text-3 mb-6">for 30 days</p>
                        <ul className="space-y-3 flex-1">
                            {TRIAL_FEATURES.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                                    <Check size={14} className="text-text-3 shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro card */}
                    <div className="bg-surface p-8 rounded-2xl border border-accent shadow-xl shadow-accent/10 flex flex-col relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-on-accent text-[9px] font-bold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap">
                            Most Popular
                        </div>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">Pro</p>
                        <div className="flex items-end gap-1.5 mb-1">
                            <span className="text-4xl font-serif text-text-1">$5</span>
                        </div>
                        <p className="text-xs text-text-3 mb-6">per month</p>
                        <ul className="space-y-3 flex-1 mb-6">
                            {PRO_FEATURES.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                                    <Check size={14} className="text-accent shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Button
                            variant="primary"
                            onClick={handleUpgrade}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <Zap size={14} />
                            Get Started
                        </Button>
                        <p className="text-center text-[10px] text-text-3 mt-3">Billed monthly. Cancel anytime.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
