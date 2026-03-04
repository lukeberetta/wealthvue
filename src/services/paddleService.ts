/**
 * WealthVue — Paddle Service
 *
 * Client-side Paddle.js initialisation and checkout helpers.
 * Uses Paddle Billing (v2) with the overlay checkout.
 */

import { initializePaddle, Paddle } from "@paddle/paddle-js";

let paddle: Paddle | undefined;

/** Fired when a Paddle checkout completes successfully. Set via setOnCheckoutComplete. */
let checkoutCompleteHandler: (() => void) | undefined;

export function setOnCheckoutComplete(handler: () => void): void {
    checkoutCompleteHandler = handler;
}

/**
 * Initialise Paddle once on app load.
 * Uses sandbox environment while VITE_PADDLE_ENVIRONMENT === "sandbox".
 */
export async function initPaddle(): Promise<void> {
    if (paddle) return; // Already initialised

    const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
    if (!token) {
        console.warn("Paddle client token not set — checkout will not work.");
        return;
    }

    const isSandbox = (import.meta.env.VITE_PADDLE_ENVIRONMENT as string) === "sandbox";

    paddle = await initializePaddle({
        environment: isSandbox ? "sandbox" : "production",
        token,
        eventCallback: (event) => {
            if (event.name === "checkout.completed") {
                checkoutCompleteHandler?.();
            }
        },
    });
}

/**
 * Open the Paddle overlay checkout for the Pro plan.
 * Attaches the Firebase UID as a custom data field so the
 * webhook Cloud Function can identify the user.
 */
export function openCheckout(email: string, uid: string): void {
    const priceId = import.meta.env.VITE_PADDLE_PRO_PRICE_ID as string | undefined;

    if (!paddle) {
        console.error("Paddle not initialised — call initPaddle() first.");
        return;
    }
    if (!priceId) {
        console.error("VITE_PADDLE_PRO_PRICE_ID is not set.");
        return;
    }

    const stored = localStorage.getItem("wealthvue-theme");
    const theme =
        stored === "light"
            ? "light"
            : stored === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "light"
              : "dark";

    paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email },
        customData: { uid },
        settings: { theme },
    });
}

/**
 * Cancel the current user's Pro subscription via the cancelSubscription
 * Cloud Function. Effective at end of the current billing period.
 */
export async function cancelSubscription(
    getIdToken: () => Promise<string>
): Promise<{ cancelAt: string | null }> {
    const token = await getIdToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const res = await fetch(`${baseUrl}/cancelSubscription`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{ cancelAt: string | null }>;
}
