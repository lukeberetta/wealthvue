import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastType = "success" | "error" | "info";

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    addToast: (message: string, type?: ToastType) => void;
}

// ---------------------------------------------------------------------------
// Context & hook
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

// ---------------------------------------------------------------------------
// Single toast
// ---------------------------------------------------------------------------

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={15} className="text-positive shrink-0" />,
    error:   <XCircle     size={15} className="text-negative shrink-0" />,
    info:    <Info        size={15} className="text-accent   shrink-0" />,
};

function ToastBubble({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit   ={{ opacity: 0, y: 8,  scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "flex items-center gap-2.5 rounded-xl shadow-lg border",
                "bg-surface border-border/60 px-3.5 py-2.5",
                "min-w-[200px] max-w-[300px]"
            )}
        >
            {ICONS[toast.type]}
            <p className="text-sm text-text-1 flex-1 leading-snug">{toast.message}</p>
            <button
                onClick={onDismiss}
                className="text-text-3 hover:text-text-1 transition-colors ml-1 shrink-0"
                aria-label="Dismiss"
            >
                <X size={13} />
            </button>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Toaster — fixed bottom-right stack
// ---------------------------------------------------------------------------

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastBubble toast={t} onDismiss={() => onDismiss(t.id)} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <Toaster toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}
