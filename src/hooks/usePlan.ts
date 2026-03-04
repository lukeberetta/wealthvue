/**
 * usePlan — Plan status and AI gate checks.
 *
 * Exposes helpers to:
 *  - check if the user's trial / subscription is active
 *  - check if they have remaining AI calls this month
 *  - determine what error message to surface when gated
 */

import { useMemo } from "react";
import { User, AI_CREDIT_LIMITS } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PlanGateReason =
    | "trial_expired"     // trial period has ended
    | "monthly_limit"     // hit the monthly call cap
    | null;               // allowed

export interface PlanStatus {
    /** Is the user on an active paid or trial plan? */
    isActive: boolean;
    /** Is this a trial user (vs paid pro)? */
    isTrial: boolean;
    /** Days remaining in trial (0 if expired or pro). */
    trialDaysLeft: number;
    /** Monthly AI calls used this month. */
    monthlyCallsUsed: number;
    /** Monthly limit (null = unlimited for pro). */
    monthlyCallLimit: number | null;
    /**
     * Check whether an AI call is allowed right now.
     * Returns null if allowed, or a PlanGateReason string if blocked.
     */
    checkAIGate: () => PlanGateReason;
    /** Human-readable error title for each gate reason. */
    gateTitle: (reason: PlanGateReason) => string;
    /** Human-readable body for each gate reason. */
    gateBody: (reason: PlanGateReason) => string;
}

// ─────────────────────────────────────────────────────────────────────────────

export function usePlan(user: User | null, isDemo: boolean): PlanStatus {
    return useMemo(() => {
        // Demo and unauthenticated users — always allow (gating happens elsewhere)
        if (!user || isDemo) {
            return {
                isActive: true,
                isTrial: false,
                trialDaysLeft: 0,
                monthlyCallsUsed: 0,
                monthlyCallLimit: null,
                checkAIGate: () => null,
                gateTitle: () => "",
                gateBody: () => "",
            };
        }

        const isPro = user.plan === "pro";
        const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
        const trialExpired = trialEndsAt ? trialEndsAt < new Date() : false;
        const trialDaysLeft = trialEndsAt && !trialExpired
            ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0;

        // Current month key  
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usage = user.aiUsage;
        const monthlyCallsUsed =
            usage && usage.currentMonth === currentMonth
                ? usage.monthlyCallCount
                : 0;

        const isActive = isPro || !trialExpired;
        const monthlyCallLimit = isPro ? null : AI_CREDIT_LIMITS.trial;

        const checkAIGate = (): PlanGateReason => {
            if (!isPro && trialExpired) return "trial_expired";
            if (!isPro && monthlyCallsUsed >= AI_CREDIT_LIMITS.trial) return "monthly_limit";
            return null;
        };

        const gateTitle = (reason: PlanGateReason): string => {
            if (reason === "trial_expired") return "Your trial has ended";
            if (reason === "monthly_limit") return "Monthly AI limit reached";
            return "";
        };

        const gateBody = (reason: PlanGateReason): string => {
            if (reason === "trial_expired")
                return "Your 30-day trial has ended. Upgrade to Pro to continue using AI-powered features.";
            if (reason === "monthly_limit")
                return `You've used all ${AI_CREDIT_LIMITS.trial} AI credits this period. Upgrade to Pro for more.`;
            return "";
        };

        return {
            isActive,
            isTrial: !isPro,
            trialDaysLeft,
            monthlyCallsUsed,
            monthlyCallLimit,
            checkAIGate,
            gateTitle,
            gateBody,
        };
    }, [user, isDemo]);
}
