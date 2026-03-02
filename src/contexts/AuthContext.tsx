import React, { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User as FirebaseUser,
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    Timestamp,
    FieldValue,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { User } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuthContextValue {
    /** Raw Firebase Auth user — null while loading or signed out */
    firebaseUser: FirebaseUser | null;
    /** Mapped WealthVue user profile loaded from Firestore */
    user: User | null;
    /** True while the initial auth state is being determined */
    loading: boolean;
    /** True when the user is viewing the product in demo mode */
    isDemo: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    setDemo: (value: boolean) => void;
    updateUser: (user: User) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helper — detect the user's currency from their IP address
// ---------------------------------------------------------------------------
async function detectCurrencyFromIP(): Promise<string> {
    try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return "USD";
        const data = await res.json();
        return (data.currency as string) || "USD";
    } catch {
        return "USD";
    }
}

// ---------------------------------------------------------------------------
// Helper — build the default Firestore profile for a brand-new user
// ---------------------------------------------------------------------------
function buildDefaultProfile(fbUser: FirebaseUser, currency: string): Record<string, unknown> {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return {
        displayName: fbUser.displayName ?? "",
        email: fbUser.email ?? "",
        photoURL: fbUser.photoURL ?? "",
        defaultCurrency: currency,
        country: "",
        themeMode: "system",
        plan: "trial",
        trialStartDate: serverTimestamp() as FieldValue,
        trialEndsAt: Timestamp.fromDate(trialEndsAt),
        goal: null,
        aiUsage: {
            totalCalls: 0,
            monthlyCallCount: 0,
            currentMonth,
            lastCalledAt: null,
        },
        createdAt: serverTimestamp() as FieldValue,
        updatedAt: serverTimestamp() as FieldValue,
    };
}

// ---------------------------------------------------------------------------
// Helper — map a Firestore document to the WealthVue User type
// ---------------------------------------------------------------------------
function mapFirestoreUser(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>,
    fbUser: FirebaseUser
): User {
    const toISO = (v: unknown): string => {
        if (v && typeof (v as Timestamp).toDate === "function") {
            return (v as Timestamp).toDate().toISOString();
        }
        return new Date().toISOString();
    };

    return {
        displayName: data.displayName ?? fbUser.displayName ?? "",
        email: data.email ?? fbUser.email ?? "",
        photoURL: data.photoURL ?? fbUser.photoURL ?? "",
        defaultCurrency: data.defaultCurrency ?? "USD",
        country: data.country ?? "",
        plan: data.plan ?? "trial",
        trialStartDate: toISO(data.trialStartDate),
        trialEndsAt: toISO(data.trialEndsAt),
        createdAt: toISO(data.createdAt),
    };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                const userRef = doc(db, "users", fbUser.uid);
                try {
                    const snap = await getDoc(userRef);

                    if (snap.exists()) {
                        // Profile already written (by Cloud Function or a previous session)
                        setUser(mapFirestoreUser(snap.data() as Record<string, unknown>, fbUser));
                    } else {
                        // Cloud Function hasn't fired yet — create the doc client-side as fallback
                        const currency = await detectCurrencyFromIP();
                        const profile = buildDefaultProfile(fbUser, currency);
                        await setDoc(userRef, profile);

                        // Re-read so Timestamps resolve properly
                        const freshSnap = await getDoc(userRef);
                        if (freshSnap.exists()) {
                            setUser(mapFirestoreUser(freshSnap.data() as Record<string, unknown>, fbUser));
                        }
                    }
                } catch (err) {
                    console.error("Failed to load/create user profile in Firestore:", err);
                    // Fallback: populate from Firebase Auth data so the app stays usable
                    const now = new Date();
                    setUser({
                        displayName: fbUser.displayName ?? "",
                        email: fbUser.email ?? "",
                        photoURL: fbUser.photoURL ?? "",
                        defaultCurrency: "USD",
                        country: "",
                        plan: "trial",
                        trialStartDate: now.toISOString(),
                        trialEndsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: now.toISOString(),
                    });
                }

                // Signing in always exits demo mode
                setIsDemo(false);
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // onAuthStateChanged handles the rest
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setIsDemo(false);
    };

    const updateUser = (updated: User) => setUser(updated);

    return (
        <AuthContext.Provider
            value={{
                firebaseUser,
                user,
                loading,
                isDemo,
                signInWithGoogle,
                signOut,
                setDemo: setIsDemo,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
