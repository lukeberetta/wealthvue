/**
 * WealthVue — useSubscription
 *
 * Centralised subscription state derived from the authenticated user's profile.
 * Consumed across the app to gate AI usage, read-only mode, and upgrade prompts.
 */

import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AI_CREDIT_LIMITS } from "../types";

export interface SubscriptionState {
    /** Plan is "trial" and the trial period has expired. */
    isTrialExpired: boolean;
    /** User cannot add/edit/delete data (trial expired and not on pro). */
    isReadOnly: boolean;
    /** How many AI credits are left this period. */
    aiCreditsRemaining: number;
    /** Total credits allowed for the current plan. */
    aiCreditLimit: number;
    /** User is allowed to make an AI call right now. */
    canUseAI: boolean;
    /** Days remaining in trial (0 once expired). Only meaningful on trial plan. */
    trialDaysRemaining: number;
}

export function useSubscription(): SubscriptionState {
    const { user, isDemo } = useAuth();

    return useMemo((): SubscriptionState => {
        // Demo users get unlimited everything (no real account)
        if (isDemo || !user) {
            return {
                isTrialExpired: false,
                isReadOnly: false,
                aiCreditsRemaining: Infinity,
                aiCreditLimit: Infinity,
                canUseAI: true,
                trialDaysRemaining: 30,
            };
        }

        const now = Date.now();
        const trialEnd = new Date(user.trialEndsAt).getTime();
        const isTrialExpired = now > trialEnd;

        // Read-only: trial is over and they haven't upgraded
        const isReadOnly = isTrialExpired && user.plan !== "pro";

        // Days remaining (floor, clamped to 0)
        const msRemaining = Math.max(0, trialEnd - now);
        const trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

        const aiCreditLimit = AI_CREDIT_LIMITS[user.plan];
        const used = user.aiUsage?.monthlyCallCount ?? 0;
        const aiCreditsRemaining = Math.max(0, aiCreditLimit - used);

        // Can use AI if credits remain and app is not read-only
        const canUseAI = aiCreditsRemaining > 0 && !isReadOnly;

        return {
            isTrialExpired,
            isReadOnly,
            aiCreditsRemaining,
            aiCreditLimit,
            canUseAI,
            trialDaysRemaining,
        };
    }, [user, isDemo]);
}
