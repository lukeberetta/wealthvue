import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Crown } from "lucide-react";
import { LandingPage } from "./features/landing/LandingPage";
import { Dashboard } from "./features/dashboard/Dashboard";
import { LoginModal } from "./features/auth/LoginModal";
import { FeedbackModal } from "./features/feedback/FeedbackModal";
import { TermsPage } from "./features/legal/TermsPage";
import { PrivacyPage } from "./features/legal/PrivacyPage";
import { RefundPage } from "./features/legal/RefundPage";
import { useTheme, ThemeMode } from "./hooks/useTheme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { setOnCheckoutComplete } from "./services/paddleService";
import { Button } from "./components/ui/Button";
import confetti from "canvas-confetti";

// ---------------------------------------------------------------------------
// Theme context — consumed by nav and settings
// ---------------------------------------------------------------------------
import { createContext, useContext } from "react";

interface ThemeContextValue {
  mode: ThemeMode;
  setTheme: (m: ThemeMode) => void;
}
export const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  setTheme: () => { },
});
export const useThemeContext = () => useContext(ThemeContext);

// ---------------------------------------------------------------------------
// Scroll-to-top on route change
// ---------------------------------------------------------------------------
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ---------------------------------------------------------------------------
// Inner app — must be inside AuthProvider so useAuth() works
// ---------------------------------------------------------------------------
function Inner() {
  const { mode, setTheme } = useTheme();
  const { user, firebaseUser, isDemo, loading, setDemo, signOut, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = React.useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = React.useState(false);

  React.useEffect(() => {
    setOnCheckoutComplete(() => {
      setShowUpgradeSuccess(true);
      const colors = ["#dce344", "#dce344", "#F5F5F5", "#2DA85C", "#111111"];
      const end = Date.now() + 2500;
      const fire = () => {
        confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors });
        if (Date.now() < end) requestAnimationFrame(fire);
      };
      fire();
      // Delay refresh to give the webhook time to update Firestore
      setTimeout(() => refreshUser(), 4000);
    });
  }, [refreshUser]);

const handleTryDemo = () => { if (user) { navigate("/app"); } else { setDemo(true); navigate("/app"); } };
  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const handleGoHome = () => navigate("/");
  const handleOpenFeedback = !isDemo && !!user ? () => setIsFeedbackModalOpen(true) : undefined;
  const handleOpenSettings = () => navigate("/app", { state: { openSettings: true } });

  return (
    <ThemeContext.Provider value={{ mode, setTheme }}>
      <div className="min-h-screen bg-bg text-text-1">
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Routes location={location}>
              <Route
                path="/"
                element={
                  <LandingPage
                    user={user}
                    firebaseUid={firebaseUser?.uid}
                    isDemo={isDemo}
                    onSignIn={() => setIsLoginModalOpen(true)}
                    onTryDemo={handleTryDemo}
                    onSignOut={handleSignOut}
                    onOpenSettings={user ? handleOpenSettings : undefined}
                    onOpenFeedback={handleOpenFeedback}
                  />
                }
              />
              <Route
                path="/app"
                element={
                  (!loading && !user && !isDemo) ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Dashboard
                      user={user}
                      isDemo={isDemo}
                      isAuthLoading={loading}
                      onSignIn={() => setIsLoginModalOpen(true)}
                      onSignOut={handleSignOut}
                      onGoHome={handleGoHome}
                      onUpdateUser={updateUser}
                      onOpenFeedback={handleOpenFeedback}
                    />
                  )
                }
              />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/refund" element={<RefundPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          user={user}
        />

        {showUpgradeSuccess && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUpgradeSuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center">
                <Crown size={28} className="text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl text-text-1">You're on Pro</h2>
                <p className="text-sm text-text-3 leading-relaxed">
                  Payment confirmed. All Pro features are now unlocked — enjoy the full WealthVue experience.
                </p>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowUpgradeSuccess(false)}
              >
                Let's go
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// App — wraps everything in AuthProvider
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Inner />
      </ToastProvider>
    </AuthProvider>
  );
}
