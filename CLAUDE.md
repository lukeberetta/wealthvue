# WealthVue — CLAUDE.md

## Project Overview

AI-powered personal net worth tracker. React SPA with no backend — all data lives in `localStorage`. Users track assets (stocks, crypto, property, vehicles, cash) in a unified dashboard with AI-assisted entry and live FX conversion.

## Tech Stack

- **React 19** + **TypeScript** + **Vite** (dev server on port 3000)
- **Tailwind CSS 4**, **React Router DOM 7**
- **Recharts** (charts), **motion** (Framer Motion v12, animations), **Lucide React** (icons)
- **Google Gemini AI** (`@google/genai`) — model rotation across 3 Flash models
- **Frankfurter API** — free FX rates, cached 1 hour in localStorage
- **date-fns** for date formatting, **uuid** for IDs
- Default currency: **ZAR**

## Commands

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # TypeScript type-check (tsc --noEmit)
npm run preview   # Preview production build
```

## Project Structure

```
src/
  App.tsx                          # Root: routing, auth context, theme provider
  main.tsx                         # Entry point, wraps BrowserRouter
  types.ts                         # All shared types (Asset, User, NAVHistoryEntry, etc.)
  index.css                        # Tailwind + CSS custom properties for theming

  components/ui/                   # Shared UI primitives
    Button, Card, Modal, AppNav, ThemeToggle

  features/
    landing/LandingPage.tsx        # Public landing/marketing page
    auth/LoginModal.tsx            # Mock auth — saves user to localStorage
    dashboard/
      Dashboard.tsx                # Main dashboard view
      hooks/useDashboard.ts        # ALL dashboard state & actions (central hook)
      components/                  # AddAssetModal, EditAssetModal, AssetList, charts
    settings/SettingsView.tsx      # User settings (currency, profile, goal)

  hooks/
    useTheme.ts                    # light/dark/system theme management
    useScrollReveal.ts             # Intersection observer scroll animations

  lib/
    storage.ts                     # localStorage CRUD: assets, user, navHistory, fxCache, goal
    fx.ts                          # fetchFXRates(), convertCurrency()
    utils.ts                       # cn(), formatCurrency(), formatCompactNumber()
    demoData.ts                    # DEMO_USER, DEMO_ASSETS, DEMO_NAV_HISTORY, DEMO_GOAL

  services/
    gemini.ts                      # AI parsing: parseTextToAsset, parseScreenshotToAssets, reestimateAssetValue
```

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

## localStorage Keys

```
wealthvue_user
wealthvue_assets
wealthvue_nav_history
wealthvue_fx_cache
wealthvue_goal
```

## AI / Gemini Service

Model rotation order (20 RPD each, falls back on 429):
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

- **No backend** — all persistence is `localStorage`; auth is entirely mock
- **`useDashboard` hook** — single source of truth for: assets, navHistory, fxRates, modal state, AI drafts, sort order, select mode. All dashboard mutations go through it.
- **Demo mode** — `DEMO_USER` email triggers read-only demo; assets come from `DEMO_ASSETS` in `demoData.ts`. Dashboard interactive elements are disabled in demo mode.
- **FX conversion** — all NAV stored in USD internally; display-converted using cached Frankfurter rates.
- **Asset input methods**: `"text"` (AI natural language), `"screenshot"` (AI image), `"manual"` (form)
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind class merging (clsx + tailwind-merge)
- Use `formatCurrency()` and `formatCompactNumber()` from `src/lib/utils.ts` for all number display

## Do Not

- Do not add a backend or database — this is intentionally a client-only app
- Do not switch AI providers away from Google Gemini
- Do not remove or bypass the model rotation logic in `gemini.ts`
- Do not commit `.env` files or API keys
