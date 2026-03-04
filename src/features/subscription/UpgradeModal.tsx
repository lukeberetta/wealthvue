import React from "react";
import { X, Zap, Check } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { openCheckout } from "../../services/paddleService";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Optional reason to show at the top (e.g. "You've used all your AI credits") */
    reason?: string;
}

const TRIAL_FEATURES = [
    "Full dashboard & portfolio tracking",
    "Net worth history (90 days)",
    "Financial goal tracking",
    "Multi-currency & FX support",
    "10 AI credits",
];

const PRO_FEATURES = [
    "Everything in Trial",
    "50 AI credits / month (renewable)",
    "Priority support",
    "Export to CSV",
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, reason }) => {
    const { user } = useAuth();
    const { aiCreditsRemaining, aiCreditLimit } = useSubscription();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        if (user) {
            openCheckout(user.email, user.email);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-border">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center text-accent">
                            <Zap size={17} />
                        </div>
                        <h2 className="font-serif text-2xl text-text-1">Upgrade to Pro</h2>
                    </div>
                    {reason && (
                        <p className="text-sm text-text-3 mt-2">{reason}</p>
                    )}
                    {!reason && (
                        <p className="text-sm text-text-3 mt-1">
                            {aiCreditsRemaining === 0
                                ? `You've used all ${aiCreditLimit} of your AI credits.`
                                : "Unlock unlimited access to WealthVue."}
                        </p>
                    )}
                </div>

                {/* Plan comparison */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    {/* Trial column */}
                    <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
                        <div>
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Trial</p>
                            <p className="text-xl font-semibold text-text-1 mt-0.5">Free</p>
                            <p className="text-xs text-text-3">30 days</p>
                        </div>
                        <ul className="space-y-2">
                            {TRIAL_FEATURES.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-xs text-text-2">
                                    <Check size={12} className="text-text-3 shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro column */}
                    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-accent text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-bl-lg">
                            Best value
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Pro</p>
                            <p className="text-xl font-semibold text-text-1 mt-0.5">$5<span className="text-sm font-normal text-text-3">/month</span></p>
                            <p className="text-xs text-text-3">Billed monthly</p>
                        </div>
                        <ul className="space-y-2">
                            {PRO_FEATURES.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-xs text-text-2">
                                    <Check size={12} className="text-accent shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 flex flex-col gap-2">
                    <Button
                        variant="primary"
                        onClick={handleUpgrade}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Zap size={15} />
                        Upgrade for $5/month
                    </Button>
                    <button
                        onClick={onClose}
                        className="text-xs text-text-3 hover:text-text-2 transition-colors text-center py-1"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};
