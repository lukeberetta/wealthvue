/**
 * WealthVue — Cloud Functions
 *
 * onUserCreate: fires when a new Firebase Auth account is created.
 * Writes the full users/{uid} Firestore profile per the schema in
 * architecture/firestore-schema.md.
 *
 * price: HTTP function that proxies Yahoo Finance quote lookups.
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import yahooFinanceModule from "yahoo-finance2";
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
