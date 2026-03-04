/**
 * WealthVue — Cloud Functions
 *
 * onUserCreate: fires when a new Firebase Auth account is created.
 * price:        proxies Yahoo Finance quote lookups for the frontend.
 * paddleWebhook: receives Paddle Billing webhook events and syncs
 *                subscription state to Firestore.
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import yahooFinanceModule from "yahoo-finance2";
import {Paddle, Environment, EventName} from "@paddle/paddle-node-sdk";

// yahoo-finance2 exports a class as its default; instantiate for use
type YFConstructor = new () => typeof yahooFinanceModule;
const yahooFinance = new (yahooFinanceModule as unknown as YFConstructor)();

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

/**
 * price — proxies Yahoo Finance quote lookups for the frontend.
 * GET /price?ticker=AAPL
 */
export const price = onRequest({cors: true}, async (req, res) => {
  const ticker = req.query.ticker as string | undefined;
  if (!ticker) {
    res.status(400).json({error: "ticker is required"});
    return;
  }
  try {
    const quote = await yahooFinance.quote(ticker, {});
    res.json(quote);
  } catch (err) {
    logger.warn(`[price] Failed for ticker=${ticker}`, err);
    const message = err instanceof Error ?
      err.message : "Failed to fetch quote";
    res.status(500).json({error: message});
  }
});

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const {uid, displayName, email, photoURL} = user;

  const now = new Date();
  const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const currentMonth =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const profile: Record<string, unknown> = {
    // Identity
    displayName: displayName ?? "",
    email: email ?? "",
    photoURL: photoURL ?? "",
    // Plan
    plan: "trial",
    trialStartDate: FieldValue.serverTimestamp(),
    trialEndsAt: admin.firestore.Timestamp.fromDate(trialEnd),
    // Preferences
    defaultCurrency: "USD",
    country: "",
    themeMode: "system",
    // Goal
    goal: null,
    // AI usage
    aiUsage: {
      totalCalls: 0,
      monthlyCallCount: 0,
      currentMonth,
      lastCalledAt: null,
    },
    // Timestamps
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("users").doc(uid).set(profile);
    logger.info(`[onUserCreate] Profile created uid=${uid} email=${email}`);
  } catch (err) {
    logger.error(`[onUserCreate] Failed for uid=${uid}`, err);
    throw err;
  }
});

/**
 * paddleWebhook — receives Paddle Billing webhook events.
 *
 * Required environment config (set via Firebase Functions config or
 * Secret Manager):
 *   PADDLE_SECRET_KEY   — Paddle API secret key (server-side)
 *   PADDLE_WEBHOOK_SECRET — webhook notification secret from Paddle dashboard
 *   PADDLE_ENVIRONMENT  — "sandbox" | "production"
 */
export const paddleWebhook = onRequest(
  {secrets: ["PADDLE_WEBHOOK_SECRET"]},
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET?.trim();

    if (!webhookSecret) {
      logger.error("[paddleWebhook] Missing PADDLE_WEBHOOK_SECRET");
      res.status(500).send("Server misconfiguration");
      return;
    }

    // Verify HMAC signature
    const signature = req.headers["paddle-signature"] as string | undefined;
    const parsedRawBody = (req as unknown as { rawBody: Buffer })
      .rawBody?.toString("utf-8") ?? "";

    // IMPORTANT: Never use JSON.stringify(req.body) here. That ruins the
    // exact spacing map required for HMAC signature verification.
    const rawBody = parsedRawBody;

    logger.info("[paddleWebhook] Debug info", {
      hasRawBodyBuffer: !!(req as unknown as { rawBody: Buffer }).rawBody,
      rawBodyLength: rawBody.length,
      signatureLength: signature?.length,
      webhookSecretLength: webhookSecret?.length,
      secretPrefix: webhookSecret?.substring(0, 4),
    });

    if (!signature) {
      logger.warn("[paddleWebhook] Missing paddle-signature header");
      res.status(400).send("Missing signature");
      return;
    }

    let event: {eventType: string; data: Record<string, unknown>};
    try {
      // Verify Paddle webhook signature manually using Node.js crypto.
      // This lets us apply a 60-second timestamp tolerance instead of the
      // SDK's default 5 seconds, which is too tight for Firebase cold starts.
      // The SDK's internal validator is not accessible via its package exports.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require("crypto") as typeof import("crypto");
      const sigParts = signature.split(";");
      const ts = sigParts.find((p: string) => p.startsWith("ts="))?.slice(3);
      const h1 = sigParts.find((p: string) => p.startsWith("h1="))?.slice(3);

      if (!ts || !h1) throw new Error("Invalid paddle-signature header");

      const nowSec = Math.floor(Date.now() / 1000);
      if (Math.abs(nowSec - parseInt(ts, 10)) > 60) {
        throw new Error("Webhook timestamp outside 60-second tolerance");
      }

      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(`${ts}:${rawBody}`, "utf8")
        .digest("hex");

      const eBuf = Buffer.from(expectedSig, "hex");
      const rBuf = Buffer.from(h1, "hex");
      if (eBuf.length !== rBuf.length || !crypto.timingSafeEqual(eBuf, rBuf)) {
        throw new Error("Signature mismatch");
      }

      // Signature verified; parse and adapt snake_case → camelCase.
      const raw = JSON.parse(rawBody) as {
        event_type: string;
        data: {id: string; custom_data?: Record<string, string> | null};
      };
      event = {
        eventType: raw.event_type,
        data: {...raw.data, customData: raw.data.custom_data ?? null},
      };
    } catch (err) {
      logger.warn("[paddleWebhook] Signature verification failed", err);
      res.status(400).send("Invalid signature");
      return;
    }

    if (!event) {
      res.status(400).send("Could not parse event");
      return;
    }

    logger.info(`[paddleWebhook] Received event: ${event.eventType}`);

    try {
      switch (event.eventType) {
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated: {
        const sub = event.data;
        // customData contains the Firebase UID we passed at checkout
        const uid = (sub.customData as Record<string, string> | null)?.uid;
        if (!uid) {
          logger.warn("[paddleWebhook] No uid in customData", sub.id);
          break;
        }

        // Check if this update is a scheduled cancellation
        const scheduledChange = sub.scheduled_change as
          {action: string; effective_at: string} | null | undefined;
        const isCancelScheduled = scheduledChange?.action === "cancel";

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-` +
            `${String(now.getMonth() + 1).padStart(2, "0")}`;

        await db.collection("users").doc(uid).update({
          "plan": "pro",
          "paddleSubscriptionId": sub.id,
          // Store scheduled cancellation date so UI can show it
          "paddleCancelAt": isCancelScheduled ?
            scheduledChange!.effective_at : FieldValue.delete(),
          // Reset AI credits for the new billing month
          "aiUsage.monthlyCallCount": 0,
          "aiUsage.currentMonth": currentMonth,
          "updatedAt": FieldValue.serverTimestamp(),
        });
        logger.info(
          `[paddleWebhook] Upgraded uid=${uid} sub=${sub.id}` +
          (isCancelScheduled ?
            ` (cancel scheduled ${scheduledChange!.effective_at})` : "")
        );
        break;
      }

      case EventName.SubscriptionCanceled: {
        const sub = event.data;
        const uid = (sub.customData as Record<string, string> | null)?.uid;
        if (!uid) {
          logger.warn(
            "[paddleWebhook] No uid in customData for cancellation",
            sub.id
          );
          break;
        }
        await db.collection("users").doc(uid).update({
          plan: "trial",
          paddleSubscriptionId: FieldValue.delete(),
          paddleCancelAt: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        logger.info(`[paddleWebhook] Downgraded uid=${uid} sub=${sub.id}`);
        break;
      }

      default:
        logger.info(
          `[paddleWebhook] Unhandled event type: ${event.eventType}`
        );
      }
    } catch (err) {
      logger.error("[paddleWebhook] Error processing event", err);
      res.status(500).send("Internal error");
      return;
    }

    res.status(200).send("OK");
  });

/**
 * cancelSubscription — cancels a user's Paddle subscription at the end of
 * the current billing period. Requires a valid Firebase ID token in the
 * Authorization header.
 */
export const cancelSubscription = onRequest(
  {secrets: ["PADDLE_SECRET_KEY", "PADDLE_ENVIRONMENT"], cors: true},
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Verify Firebase ID token
    const authHeader = req.headers.authorization ?? "";
    const idToken = authHeader.startsWith("Bearer ") ?
      authHeader.slice(7) : null;
    if (!idToken) {
      res.status(401).send("Unauthorized");
      return;
    }

    let uid: string;
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      res.status(401).send("Invalid token");
      return;
    }

    // Get paddleSubscriptionId from Firestore
    const userSnap = await db.collection("users").doc(uid).get();
    const subscriptionId = userSnap.data()?.paddleSubscriptionId as
      string | undefined;
    if (!subscriptionId) {
      res.status(400).send("No active subscription");
      return;
    }

    // Cancel via Paddle API — effective at end of current billing period
    const secretKey = process.env.PADDLE_SECRET_KEY?.trim();
    const envStr = process.env.PADDLE_ENVIRONMENT?.trim();
    const environment = envStr === "production" ?
      Environment.production : Environment.sandbox;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const paddle = new Paddle(secretKey!, {environment});

    // Attempt to cancel; if already pending cancellation, continue gracefully
    let alreadyPending = false;
    try {
      await paddle.subscriptions.cancel(
        subscriptionId,
        {effectiveFrom: "next_billing_period"}
      );
      logger.info(
        `[cancelSubscription] Scheduled uid=${uid} sub=${subscriptionId}`
      );
    } catch (err) {
      const errCode = (err as {code?: string}).code;
      if (errCode === "subscription_locked_pending_changes") {
        alreadyPending = true;
        logger.info(
          `[cancelSubscription] Already pending uid=${uid} — reading state`
        );
      } else {
        logger.error("[cancelSubscription] Paddle API error", err);
        res.status(500).send("Failed to cancel subscription");
        return;
      }
    }

    // Fetch subscription to get the effective cancellation date and persist it
    // directly to Firestore (so the UI updates without relying on the webhook).
    let cancelAt: string | null = null;
    try {
      const sub = await paddle.subscriptions.get(subscriptionId);
      const scheduled = (sub as unknown as {
        scheduledChange?: {action: string; effectiveAt: string} | null;
      }).scheduledChange;
      if (scheduled?.action === "cancel" && scheduled.effectiveAt) {
        cancelAt = scheduled.effectiveAt;
        await db.collection("users").doc(uid).update({
          paddleCancelAt: cancelAt,
          updatedAt: FieldValue.serverTimestamp(),
        });
        logger.info(
          `[cancelSubscription] Wrote paddleCancelAt=${cancelAt}` +
          ` uid=${uid}${alreadyPending ? " (was already pending)" : ""}`
        );
      }
    } catch (fetchErr) {
      logger.warn(
        "[cancelSubscription] Could not fetch subscription details",
        fetchErr
      );
    }

    res.status(200).json({ok: true, cancelAt});
  }
);
