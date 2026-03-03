# WealthVue — CLAUDE.md

## Project Overview

AI-powered personal net worth tracker. React SPA backed by **Firebase** (Auth + Firestore + Cloud Functions + Hosting). Users track assets (stocks, crypto, property, vehicles, cash) in a unified dashboard with AI-assisted entry and live FX conversion.

## Tech Stack

- **React 19** + **TypeScript** + **Vite** (dev server on port 3000)
- **Tailwind CSS 4**, **React Router DOM 7**
- **Recharts** (charts), **motion** (Framer Motion v12, animations), **Lucide React** (icons)
- **Firebase 12** (`firebase`) — Auth (Google Sign-in), Firestore, Analytics, Hosting
- **Firebase Cloud Functions** (`firebase-functions` v7, `firebase-admin` v13) — TypeScript, Node.js
- **Google Gemini AI** (`@google/genai`) — model rotation across 3 Flash models
- **Frankfurter API** — free FX rates, cached 1 hour in Firestore (shared) and localStorage (demo)
- **date-fns** for date formatting, **uuid** for IDs
- Default currency: **ZAR**

## Commands

```bash
# Frontend
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # TypeScript type-check (tsc --noEmit)
npm run preview   # Preview production build
npm run emulators # Start Firebase Emulator Suite (Auth 9099, Firestore 8080, Functions 5001, UI 4000)
npm run publish   # Build + deploy to Firebase Hosting & Functions

# Functions (from /functions)
npm run build     # Compile TypeScript
npm run serve     # Local functions server
npm run deploy    # Deploy functions only
```

## Project Structure

```
src/
  App.tsx                          # Root: routing, auth context, theme provider
  main.tsx                         # Entry point — imports firebase init
  types.ts                         # All shared types (Asset, User, NAVHistoryEntry, etc.)
  index.css                        # Tailwind + CSS custom properties for theming

  components/ui/                   # Shared UI primitives
    Button, Card, Modal, AppNav, ThemeToggle

  contexts/
    AuthContext.tsx                 # Google Auth provider, Firestore user profile read/write

  features/
    landing/LandingPage.tsx        # Public landing/marketing page
    auth/LoginModal.tsx            # Auth UI — Google Sign-in via Firebase Auth
    dashboard/
      Dashboard.tsx                # Main dashboard view
      hooks/useDashboard.ts        # ALL dashboard state & actions (central hook)
      components/                  # AddAssetModal, EditAssetModal, AssetList, charts
    settings/SettingsView.tsx      # User settings (currency, profile, goal)

  hooks/
    useTheme.ts                    # light/dark/system theme management
    useScrollReveal.ts             # Intersection observer scroll animations

  lib/
    firebase.ts                    # Firebase app init: auth, db (Firestore), analyticsPromise
    storage.ts                     # localStorage CRUD — used only for demo mode
    fx.ts                          # fetchFXRates(), convertCurrency() — caches in Firestore + localStorage
    utils.ts                       # cn(), formatCurrency(), formatCompactNumber()
    benchmark.ts                   # fetchSP500History() — S&P 500 via CORS proxy, cached in localStorage
    demoData.ts                    # DEMO_USER, DEMO_ASSETS, DEMO_NAV_HISTORY, DEMO_GOAL

  services/
    gemini.ts                      # AI parsing: parseTextToAsset, parseScreenshotToAssets, reestimateAssetValue
    firestoreService.ts            # All Firestore CRUD: assets, navHistory, goals, fxCache, AI usage

functions/
  src/index.ts                     # Cloud Functions:
                                   #   onUserCreate — init Firestore profile on signup
                                   #   price (HTTP) — Yahoo Finance proxy at GET /api/price?ticker=
```

## Firestore Schema

```
fxCache/
  latest                           # Shared across all users; 1-hour TTL
    { baseCurrency, rates, fetchedAt }

users/{uid}                        # User profile + preferences
  { displayName, email, photoURL, defaultCurrency, country,
    plan, trialStartDate, trialEndsAt, themeMode,
    goal: { targetAmount, currency },
    aiUsage: { count, resetAt },
    createdAt, updatedAt }

  assets/{assetId}                 # Portfolio assets
    { name, description, assetType, ticker, quantity,
      unitPrice, unitPriceCurrency, totalValue, totalValueCurrency,
      valueSource, source, aiConfidence, aiRationale,
      inputMethod, lastRefreshed, createdAt, updatedAt }

  navHistory/{YYYY-MM-DD}          # Daily NAV snapshots
    { date, totalNAV (USD), displayCurrency, recordedAt }
```

Security rules: FX cache is readable/writable by any authenticated user. All user data is owner-only (`request.auth.uid == uid`).

## Core Types (`src/types.ts`)

```typescript
Asset {
  id, name, description, assetType, ticker, quantity,
  unitPrice, unitPriceCurrency, totalValue, totalValueCurrency,
  valueSource, source, aiConfidence, aiRationale,
  inputMethod, lastRefreshed, createdAt, updatedAt
}

User {
  displayName, email, photoURL, defaultCurrency, country,
  plan, trialStartDate, trialEndsAt, createdAt
}

NAVHistoryEntry { date, totalNAV, displayCurrency }
FinancialGoal { targetAmount, currency }
FXCache { rates: { [currencyCode]: number }, fetchedAt }

AssetType = "stock" | "crypto" | "vehicle" | "property" | "cash" | "other"
ValueSource = "ai_estimate" | "live_price" | "manual"
AIConfidence = "high" | "medium" | "low"
PlanType = "trial" | "pro"
```

## Environment Variables

Frontend (`.env.local`, `VITE_` prefixed):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_USE_EMULATOR=true   # optional — connects to local emulators
```

## AI / Gemini Service

Model rotation order (falls back on 429 / RESOURCE_EXHAUSTED):
1. `gemini-3-flash-preview`
2. `gemini-2.5-flash-lite`
3. `gemini-2.5-flash`

Key functions in `src/services/gemini.ts`:
- `parseTextToAsset(text)` — natural language → structured Asset with live price (Google Search tool)
- `parseScreenshotToAssets(base64)` — screenshot → array of Assets
- `reestimateAssetValue(asset)` — refresh a stale asset's price

The `callAIWithRotation()` helper wraps all Gemini calls and handles quota rotation automatically. Only retry on `RESOURCE_EXHAUSTED` / 429 errors; surface other errors immediately.

## Theming

CSS custom properties on `document.documentElement`, persisted to localStorage.

- **Dark** (default): bg `#1A1714`, surface `#231F1B`, accent `#C96442` (terracotta), positive `#5D8F6E`, negative `#A0504A`
- **Light**: bg `#F5F1EB`, text `#1C1714`, same accent
- **Fonts**: Playfair Display (headings), DM Sans (body)
- Managed by `src/hooks/useTheme.ts`; three modes: `light`, `dark`, `system`

## Key Patterns & Conventions

- **Firebase Auth** — Google Sign-in via popup; `AuthContext` manages user state and Firestore profile sync. `onUserCreate` Cloud Function initialises the Firestore profile on first signup.
- **Firestore as primary store** — all user data (assets, NAV history, goals, AI usage) lives in Firestore. `src/services/firestoreService.ts` is the single place for all Firestore reads/writes.
- **localStorage for demo mode only** — `src/lib/storage.ts` is only used when `isDemo` is true. Do not use it for real user data.
- **Shared FX cache** — `fxCache/latest` in Firestore is shared across users to avoid redundant Frankfurter API calls; 1-hour TTL.
- **`useDashboard` hook** — single source of truth for: assets, navHistory, fxRates, modal state, AI drafts, sort order, select mode. All dashboard mutations go through it.
- **Demo mode** — `DEMO_USER` email triggers read-only demo; assets come from `DEMO_ASSETS` in `demoData.ts`. Firestore calls are bypassed in demo mode.
- **FX conversion** — all NAV stored in USD internally; display-converted using cached Frankfurter rates.
- **Asset input methods**: `"text"` (AI natural language), `"screenshot"` (AI image), `"manual"` (form)
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind class merging (clsx + tailwind-merge)
- Use `formatCurrency()` and `formatCompactNumber()` from `src/lib/utils.ts` for all number display

## Do Not

- Do not use `src/lib/storage.ts` for real user data — it is demo mode only; use `firestoreService.ts`
- Do not switch AI providers away from Google Gemini
- Do not remove or bypass the model rotation logic in `gemini.ts`
- Do not commit `.env` files or API keys
