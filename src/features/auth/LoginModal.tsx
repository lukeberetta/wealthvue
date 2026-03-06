import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../contexts/AuthContext";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);
        try {
            await signInWithGoogle();
            onClose();
            navigate("/app");
        } catch (err: unknown) {
            console.error("Google sign-in failed:", err);
            // Don't show an error for user-cancelled popups
            const code = (err as { code?: string })?.code;
            if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
                setError("Sign-in failed. Please try again.");
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sign In">
            <div className="flex flex-col items-center text-center py-4">
                <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 rounded-2xl mb-6 shadow-sm text-text-1">
                    <rect width="256" height="256" fill="currentColor" />
                    <path d="M83.3 159.841C82.3363 162.681 79.6704 164.591 76.6713 164.591H60.9572C58.1196 164.591 55.5627 162.878 54.4834 160.254L29.9741 100.663C28.0794 96.0558 31.4667 91 36.448 91H46.2728C49.1908 91 51.8026 92.81 52.8272 95.5421L63.0808 122.885C65.4071 129.089 74.2504 128.889 76.2938 122.586L84.9651 95.8411C85.9009 92.9548 88.5896 91 91.6238 91H106.061C109.054 91 111.716 92.9027 112.684 95.7345L121.588 121.765C123.711 127.971 132.438 128.111 134.759 121.976L144.765 95.5234C145.795 92.8011 148.401 91 151.312 91H158.744C163.708 91 167.094 96.0236 165.233 100.625L141.124 160.216C140.054 162.861 137.487 164.591 134.635 164.591H121.032C118.079 164.591 115.443 162.738 114.445 159.959L105.181 134.188C102.94 127.953 94.0946 128.032 91.9654 134.306L83.3 159.841Z" style={{ fill: 'var(--color-bg)' }} />
                    <path d="M143.344 159.841C142.38 162.681 139.715 164.591 136.716 164.591H121.001C118.164 164.591 115.607 162.878 114.528 160.254L90.0183 100.663C88.1236 96.0558 91.5109 91 96.4922 91H106.317C109.235 91 111.847 92.81 112.871 95.5421L123.125 122.885C125.451 129.089 134.295 128.889 136.338 122.586L145.009 95.8411C145.945 92.9548 148.634 91 151.668 91H166.105C169.098 91 171.76 92.9027 172.729 95.7345L181.632 121.765C183.755 127.971 192.482 128.111 194.803 121.976L204.809 95.5234C205.839 92.8011 208.446 91 211.356 91H218.788C223.752 91 227.139 96.0236 225.277 100.625L201.168 160.216C200.098 162.861 197.531 164.591 194.679 164.591H181.076C178.123 164.591 175.488 162.738 174.489 159.959L165.226 134.188C162.984 127.953 154.139 128.032 152.01 134.306L143.344 159.841Z" style={{ fill: 'var(--color-bg)' }} />
                </svg>
                <h2 className="text-2xl font-normal mb-2">Welcome to WealthVue</h2>
                <p className="text-text-2 mb-8">Sign in to start managing your portfolio.</p>

                <button
                    id="btn-google-signin"
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border border-border hover:bg-gray-50 transition-colors py-3 rounded-lg font-normal shadow-sm disabled:opacity-50"
                >
                    {isSigningIn ? (
                        <Loader2 className="animate-spin text-gray-900" size={20} />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    {isSigningIn ? "Signing in..." : "Continue with Google"}
                </button>

                {error && (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                )}

                <p className="mt-6 text-xs text-text-3">
                    By continuing, you agree to WealthVue's Terms of Service and Privacy Policy.
                </p>
            </div>
        </Modal>
    );
};
