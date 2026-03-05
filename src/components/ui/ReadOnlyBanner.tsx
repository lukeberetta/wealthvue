import React from "react";
import { Lock, Zap } from "lucide-react";
import { Button } from "./Button";
import { openCheckout } from "../../services/paddleService";
import { useAuth } from "../../contexts/AuthContext";

interface ReadOnlyBannerProps {
    onUpgradeClick?: () => void;
}

/**
 * Persistent top-of-page banner shown when the user's trial has expired.
 * Prompts them to upgrade to Pro to resume editing.
 */
export const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({ onUpgradeClick }) => {
    const { user, firebaseUser } = useAuth();

    const handleUpgrade = () => {
        if (onUpgradeClick) {
            onUpgradeClick();
        } else if (user && firebaseUser) {
            openCheckout(user.email, firebaseUser.uid);
        }
    };

    return (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-amber-400 min-w-0">
                <Lock size={14} className="shrink-0" />
                <p className="text-xs font-normal truncate">
                    Your free trial has ended. Your data is safe — upgrade to continue editing.
                </p>
            </div>
            <Button
                variant="ghost"
                onClick={handleUpgrade}
                className="shrink-0 text-xs text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 h-auto"
            >
                <Zap size={12} />
                Upgrade
            </Button>
        </div>
    );
};
