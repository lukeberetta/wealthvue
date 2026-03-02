import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { LandingPage } from "./features/landing/LandingPage";
import { Dashboard } from "./features/dashboard/Dashboard";
import { LoginModal } from "./features/auth/LoginModal";
import { useTheme, ThemeMode } from "./hooks/useTheme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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
// Protected route — allows access if signed in OR in demo mode
// ---------------------------------------------------------------------------
function AppRoute() {
  const { user, isDemo, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isDemo) {
    return <Navigate to="/" replace />;
  }

  return null; // renders the Dashboard below via the outer Routes
}

// ---------------------------------------------------------------------------
// Inner app — must be inside AuthProvider so useAuth() works
// ---------------------------------------------------------------------------
function Inner() {
  const { mode, setTheme } = useTheme();
  const { user, isDemo, loading, setDemo, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  // Redirect to /app once signed in from the landing page
  React.useEffect(() => {
    if (user && location.pathname === "/") {
      navigate("/app", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleTryDemo = () => { setDemo(true); navigate("/app"); };
  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const handleGoHome = () => navigate("/");

  return (
    <ThemeContext.Provider value={{ mode, setTheme }}>
      <div className="min-h-screen bg-bg text-text-1">
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
                    isDemo={isDemo}
                    onSignIn={() => setIsLoginModalOpen(true)}
                    onTryDemo={handleTryDemo}
                    onSignOut={handleSignOut}
                  />
                }
              />
              <Route
                path="/app"
                element={
                  loading ? (
                    <div className="min-h-screen bg-bg flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (!user && !isDemo) ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Dashboard
                      user={user}
                      isDemo={isDemo}
                      onSignIn={() => setIsLoginModalOpen(true)}
                      onSignOut={handleSignOut}
                      onGoHome={handleGoHome}
                      onUpdateUser={updateUser}
                    />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
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
      <Inner />
    </AuthProvider>
  );
}
