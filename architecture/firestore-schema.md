# WealthVue — Firestore Schema

## Overview

All user data lives under `users/{uid}`, where `{uid}` is the Firebase Auth UID. A single shared top-level document handles the FX rate cache to avoid redundant external API calls across users.

---

## Collection Hierarchy

```
firestore/
│
├── fxCache/
│   └── latest                          # Shared FX rates (all users)
│
└── users/
    └── {uid}                           # User profile, preferences, goal, AI usage
          ├── assets/
          │   └── {assetId}             # One document per portfolio asset
          └── navHistory/
              └── {YYYY-MM-DD}          # One document per day (date = document ID)
```

---

## Documents

### `fxCache/latest`

Shared across all users. Cached for 1 hour and refreshed by any client that finds it stale.

| Field | Type | Description |
|---|---|---|
| `baseCurrency` | `string` | Always `"USD"` — all rates relative to USD |
| `rates` | `map<string, number>` | Currency code → multiplier, e.g. `{ "ZAR": 18.5, "EUR": 0.92, "GBP": 0.79 }` |
| `fetchedAt` | `Timestamp` | When rates were last fetched from Frankfurter API |

**Design notes:**
- Stale if `fetchedAt` is > 1 hour ago
- Clients should read before fetching from Frankfurter; write back after a fresh fetch
- Security rules: world-readable, write restricted to authenticated users

---

### `users/{uid}`

User profile, account settings, preferences, financial goal, and AI usage counters — all embedded in a single document.

#### Identity & Account

| Field | Type | Description |
|---|---|---|
| `displayName` | `string` | Full name, e.g. `"Alex Morgan"` |
| `email` | `string` | Email address |
| `photoURL` | `string` | Avatar URL (e.g. DiceBear API URL) |
| `createdAt` | `Timestamp` | Account creation time |
| `updatedAt` | `Timestamp` | Last profile modification |

#### Plan & Subscription

| Field | Type | Description |
|---|---|---|
| `plan` | `"trial" \| "pro"` | Current subscription tier |
| `trialStartDate` | `Timestamp` | When the trial began |
| `trialEndsAt` | `Timestamp` | Trial expiry time |

#### Preferences

| Field | Type | Description |
|---|---|---|
| `defaultCurrency` | `string` | ISO 4217 display currency, e.g. `"ZAR"`, `"USD"` |
| `country` | `string` | Country code, e.g. `"ZA"`, `"US"`, `"GB"` |
| `themeMode` | `"light" \| "dark" \| "system"` | UI theme preference (synced across devices) |

#### Financial Goal (embedded map)

Embedded directly — only 2 fields, no subcollection needed.

| Field | Type | Description |
|---|---|---|
| `goal` | `map \| null` | `null` if no goal is set |
| `goal.targetAmount` | `number` | Target net worth, e.g. `10000000` |
| `goal.currency` | `string` | ISO 4217 currency for the goal amount, e.g. `"ZAR"` |

#### AI Usage (embedded map)

Tracks Gemini API calls per user for plan enforcement and rate limiting.

| Field | Type | Description |
|---|---|---|
| `aiUsage.totalCalls` | `number` | Lifetime AI call count |
| `aiUsage.monthlyCallCount` | `number` | Calls in the current calendar month; reset each month |
| `aiUsage.currentMonth` | `string` | Active month key, e.g. `"2026-03"` |
| `aiUsage.lastCalledAt` | `Timestamp \| null` | Timestamp of the most recent AI call |

**Design notes:**
- Increment `totalCalls` and `monthlyCallCount` atomically via `FieldValue.increment(1)`
- On each call, check if `currentMonth` matches today's month; if not, reset `monthlyCallCount` to `1` and update `currentMonth`
- Security rules: only the owning user can read/write their document

---

### `users/{uid}/assets/{assetId}`

One document per portfolio asset. `{assetId}` is a UUID generated client-side (matching the current `id` field on the `Asset` type).

#### Core Fields

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Display name, e.g. `"Apple Inc"`, `"Bitcoin"` |
| `description` | `string` | Short description, e.g. `"Technology giant"` |
| `assetType` | `string` | One of: `stock`, `crypto`, `commodities`, `etf`, `vehicle`, `property`, `cash`, `other` |
| `ticker` | `string \| null` | Yahoo Finance ticker, e.g. `"AAPL"`, `"BTC-USD"`, `"VOO"` — `null` if not applicable |
| `source` | `string \| null` | Institution or platform, e.g. `"Binance"`, `"Robinhood"` |

#### Valuation

| Field | Type | Description |
|---|---|---|
| `quantity` | `number` | Units held, e.g. `48` shares, `0.45` BTC, `1` property |
| `unitPrice` | `number` | Price per unit |
| `unitPriceCurrency` | `string` | ISO 4217 currency for `unitPrice` |
| `totalValue` | `number` | `quantity × unitPrice` |
| `totalValueCurrency` | `string` | ISO 4217 currency for `totalValue` |
| `valueSource` | `string` | One of: `ai_estimate`, `live_price`, `manual` |

#### AI Metadata

| Field | Type | Description |
|---|---|---|
| `inputMethod` | `string` | How asset was entered: `text`, `screenshot`, `manual` |
| `aiConfidence` | `"high" \| "medium" \| "low" \| null` | AI confidence in valuation — `null` for manual entries |
| `aiRationale` | `string \| null` | AI explanation of how value was determined — `null` for manual entries |

#### Timestamps

| Field | Type | Description |
|---|---|---|
| `lastRefreshed` | `Timestamp` | When the price was last updated (AI re-estimate or live fetch) |
| `createdAt` | `Timestamp` | When the asset was first added |
| `updatedAt` | `Timestamp` | Last modification |

**Design notes:**
- Query assets by `assetType` for filtered views (ensure composite index on `uid` + `assetType` if needed)
- `totalValue` is denormalized for fast aggregation — recompute on any `quantity` or `unitPrice` change
- Security rules: only the owning user can read/write their assets subcollection

---

### `users/{uid}/navHistory/{YYYY-MM-DD}`

One document per calendar day. The document ID is the date string (e.g. `"2026-03-02"`) for natural ordering and idempotent daily writes.

| Field | Type | Description |
|---|---|---|
| `date` | `string` | ISO 8601 date string matching the document ID, e.g. `"2026-03-02"` |
| `totalNAV` | `number` | Total portfolio value in USD at time of snapshot |
| `displayCurrency` | `string` | User's display currency at the time of the snapshot |
| `recordedAt` | `Timestamp` | Server timestamp of write (`FieldValue.serverTimestamp()`) |

**Design notes:**
- Write using `setDoc` with `merge: false` — one canonical record per day, last write wins
- Use `orderBy("date", "desc")` and `limit(90)` for the chart query (90-day history window)
- `totalNAV` is always USD so historical entries remain consistent even if `defaultCurrency` changes
- Security rules: only the owning user can read/write their navHistory subcollection

---

## Security Rules (outline)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Shared FX cache — authenticated users can read; any authenticated user can write
    match /fxCache/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // User documents — only the owning user
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /assets/{assetId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }

      match /navHistory/{date} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

---

## localStorage → Firestore Migration Map

| localStorage Key | Firestore Path |
|---|---|
| `wealthvue_user` | `users/{uid}` |
| `wealthvue_assets` | `users/{uid}/assets/{assetId}` |
| `wealthvue_nav_history` | `users/{uid}/navHistory/{YYYY-MM-DD}` |
| `wealthvue_fx_cache` | `fxCache/latest` |
| `wealthvue_goal` | `users/{uid}.goal` (embedded map) |

---

## Recommended Indexes

| Collection | Fields | Query |
|---|---|---|
| `users/{uid}/navHistory` | `date ASC` | Chart time-series |
| `users/{uid}/assets` | `assetType ASC`, `totalValue DESC` | Filtered/sorted asset list |
| `users/{uid}/assets` | `createdAt DESC` | Recently added assets |
