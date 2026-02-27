import { User, Asset, NAVHistoryEntry, FXCache } from "../types";
import { DEMO_USER, DEMO_ASSETS, DEMO_NAV_HISTORY } from "./demoData";

const KEYS = {
  USER: "wealthvue_user",
  ASSETS: "wealthvue_assets",
  NAV_HISTORY: "wealthvue_nav_history",
  FX_CACHE: "wealthvue_fx_cache",
};

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  saveUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.ASSETS);
    localStorage.removeItem(KEYS.NAV_HISTORY);
  },
  getAssets: (isDemo: boolean): Asset[] => {
    if (isDemo) return DEMO_ASSETS;
    const data = localStorage.getItem(KEYS.ASSETS);
    return data ? JSON.parse(data) : [];
  },
  saveAssets: (assets: Asset[]) => {
    localStorage.setItem(KEYS.ASSETS, JSON.stringify(assets));
  },
  getNAVHistory: (isDemo: boolean): NAVHistoryEntry[] => {
    if (isDemo) return DEMO_NAV_HISTORY;
    const data = localStorage.getItem(KEYS.NAV_HISTORY);
    return data ? JSON.parse(data) : [];
  },
  saveNAVHistory: (history: NAVHistoryEntry[]) => {
    localStorage.setItem(KEYS.NAV_HISTORY, JSON.stringify(history));
  },
  getFXCache: (): FXCache | null => {
    const data = localStorage.getItem(KEYS.FX_CACHE);
    return data ? JSON.parse(data) : null;
  },
  saveFXCache: (cache: FXCache) => {
    localStorage.setItem(KEYS.FX_CACHE, JSON.stringify(cache));
  },
};
