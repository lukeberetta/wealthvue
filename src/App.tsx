import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { storage } from "./lib/storage";
import { User } from "./types";
import { LandingPage } from "./features/landing/LandingPage";
import { Dashboard } from "./features/dashboard/Dashboard";
import { LoginModal } from "./features/auth/LoginModal";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
      // Only redirect to dashboard if on landing page and user is already logged in
      if (window.location.pathname === '/') {
        navigate('/app', { replace: true });
      }
    }
  }, []);

  const handleSignIn = () => {
    const mockUser: User = {
      displayName: "Alex Morgan",
      email: "alex@example.com",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      defaultCurrency: "ZAR",
      plan: "trial",
      trialStartDate: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    storage.saveUser(mockUser);
    setUser(mockUser);
    setIsDemo(false);
    navigate('/app');
  };

  const handleTryDemo = () => {
    setIsDemo(true);
    navigate('/app');
  };

  const handleSignOut = () => {
    storage.clearUser();
    setUser(null);
    setIsDemo(false);
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storage.saveUser(updatedUser);
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route
              path="/"
              element={
                <LandingPage onSignIn={() => setIsLoginModalOpen(true)} onTryDemo={handleTryDemo} />
              }
            />
            <Route
              path="/app"
              element={
                <Dashboard
                  user={user}
                  isDemo={isDemo}
                  onSignOut={handleSignOut}
                  onGoHome={handleGoHome}
                  onUpdateUser={handleUpdateUser}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignIn={handleSignIn}
      />
    </div>
  );
}
