<div align="center">

<br />

# 💰 WealthVue

### *Your wealth, in full view.*

AI-powered personal net worth tracker — add assets in plain English, see your financial picture at a glance, and track your progress toward financial freedom.

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

<br />

</div>

---

## ✨ Features

- **🤖 AI-Powered Asset Entry** — Type something like *"100 shares of Apple bought at $150"* and Gemini AI parses it into a structured asset with live market prices, automatically.
- **📸 Screenshot Import** — Snap a photo of your brokerage statement or portfolio page; Gemini extracts your assets directly from the image.
- **💹 Live Market Prices** — Stocks, ETFs, and crypto are priced in real-time via Gemini's Google Search grounding.
- **🌍 Multi-Currency Support** — Every asset is stored in its native currency and converted on-the-fly using live Frankfurter FX rates (ZAR default).
- **📊 Net Worth Dashboard** — A unified view of your total NAV, asset breakdown by type or account, and historical net worth charted over time.
- **🎯 Financial Goal Tracking** — Set a target figure and track your progress with a visual progress bar.
- **🌗 Light / Dark / System Theme** — A beautiful terracotta-accented design system that respects your OS preference.
- **🔒 Firebase Auth + Firestore Sync** — Data syncs securely across devices for signed-in users; demo mode available with zero sign-up friction.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Google Gemini API key** ([get one free](https://aistudio.google.com/app/apikey))
- A **Firebase project** with Firestore enabled (for auth + sync)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/wealthvue.git
cd wealthvue

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# → Fill in VITE_GEMINI_API_KEY, VITE_FIREBASE_* values

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip:** Want to explore without signing up? Click **Try the Demo** on the landing page for a fully interactive read-only experience.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Routing | React Router DOM 7 |
| Charts | Recharts |
| Animations | Motion (Framer Motion v12) |
| Icons | Lucide React |
| AI | Google Gemini (`@google/genai`) |
| FX Rates | Frankfurter API (free, cached 1h) |
| Auth & DB | Firebase Auth + Firestore |
| Date Utils | date-fns |

---

## 📁 Project Structure

```
src/
├── App.tsx                      # Root: routing, auth context, theme provider
├── main.tsx                     # Entry point
│
├── features/
│   ├── landing/                 # Marketing / landing page
│   ├── auth/                    # Login modal (Firebase Auth)
│   ├── dashboard/               # Main dashboard view + useDashboard hook
│   ├── settings/                # User preferences, currency, goal
│   └── feedback/                # User feedback modal
│
├── components/ui/               # Shared UI primitives (Button, Card, Modal, Nav)
│
├── services/
│   └── gemini.ts                # AI: parseTextToAsset, parseScreenshotToAssets, reestimateAssetValue
│
├── lib/
│   ├── storage.ts               # Firestore + localStorage CRUD layer
│   ├── fx.ts                    # fetchFXRates(), convertCurrency()
│   └── utils.ts                 # cn(), formatCurrency(), formatCompactNumber()
│
├── hooks/
│   ├── useTheme.ts              # light / dark / system theme management
│   └── useScrollReveal.ts       # Intersection observer scroll animations
│
├── contexts/
│   └── AuthContext.tsx          # Firebase auth state + demo mode context
│
├── data/
│   └── demoData.ts              # DEMO_USER, DEMO_ASSETS, DEMO_NAV_HISTORY, DEMO_GOAL
│
└── types/
    └── types.ts                 # All shared TypeScript types
```

---

## 🧠 AI Integration

WealthVue uses **Google Gemini** for all AI features. Three Flash models are rotated automatically to stay within free-tier rate limits:

1. `gemini-2.5-flash-preview-05-20` *(primary)*
2. `gemini-2.5-flash-lite` *(fallback)*
3. `gemini-2.5-flash` *(final fallback)*

| Function | What it does |
|---|---|
| `parseTextToAsset(text)` | Natural language → structured `Asset` with live price via Google Search grounding |
| `parseScreenshotToAssets(base64)` | Portfolio screenshot → array of `Asset` objects |
| `reestimateAssetValue(asset)` | Refresh a stale asset's current market price |

Model rotation is handled transparently by `callAIWithRotation()` — it only retries on `RESOURCE_EXHAUSTED` (429) errors and surfaces all other errors immediately.

---

## 🎨 Design System

WealthVue uses a warm, neutral palette built on CSS custom properties, toggled between light and dark modes.

| Token | Dark | Light |
|---|---|---|
| Background | `#1A1714` | `#F5F1EB` |
| Surface | `#231F1B` | `#FFFFFF` |
| Accent | `#C96442` (terracotta) | `#C96442` |
| Positive | `#5D8F6E` | `#3D7A5A` |
| Negative | `#A0504A` | `#8B3E3A` |
| Heading Font | Playfair Display | — |
| Body Font | DM Sans | — |

---

## ⚙️ Available Scripts

```bash
npm run dev        # Start dev server on localhost:3000
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
npm run lint       # TypeScript type-check (tsc --noEmit)
npm run publish    # Build + deploy to Firebase Hosting
npm run emulators  # Start Firebase emulators (requires Java)
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and populate the following:

```env
# Google Gemini
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> ⚠️ Never commit `.env` or `.env.local` to version control. They are already in `.gitignore`.

---

## 🧑‍💻 Development Notes

- **`useDashboard` hook** is the single source of truth for all dashboard state — assets, NAV history, FX rates, modal state, AI drafts, sort order. All mutations go through it.
- **Demo mode** is triggered by the `DEMO_USER` email. It's fully read-only; interactive elements are disabled. Assets come from `demoData.ts`.
- **FX conversion** — NAV values are stored natively per asset currency; everything is converted for display using cached Frankfurter rates (1-hour TTL).
- Use `cn()` from `src/lib/utils.ts` for all conditional class merging (clsx + tailwind-merge).
- Use `formatCurrency()` and `formatCompactNumber()` for all monetary display — never raw `.toLocaleString()`.

---

<div align="center">

Built with ❤️ and a lot of ☕

</div>
