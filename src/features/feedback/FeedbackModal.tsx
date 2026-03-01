import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Send, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { User } from "../../types";
import { cn } from "../../lib/utils";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

type FeedbackType = "bug" | "feature" | "general";

const FEEDBACK_TYPES: { value: FeedbackType; label: string; description: string }[] = [
    { value: "bug", label: "Bug Report", description: "Something isn't working" },
    { value: "feature", label: "Feature Request", description: "Suggest an improvement" },
    { value: "general", label: "General Feedback", description: "Thoughts or questions" },
];

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined;

export function FeedbackModal({ isOpen, onClose, user }: FeedbackModalProps) {
    const [type, setType] = useState<FeedbackType>("general");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const handleClose = () => {
        if (status === "sending") return;
        onClose();
        // Reset after close animation
        setTimeout(() => {
            setType("general");
            setMessage("");
            setStatus("idle");
            setErrorMsg("");
        }, 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatus("sending");
        setErrorMsg("");

        const payload = {
            name: user?.displayName ?? "Anonymous",
            email: user?.email ?? "unknown",
            type: FEEDBACK_TYPES.find(t => t.value === type)?.label ?? type,
            message: message.trim(),
        };

        // If no Formspree endpoint configured, fall back to mailto
        if (!FORMSPREE_ENDPOINT) {
            const subject = encodeURIComponent(`[WealthVue Feedback] ${payload.type}`);
            const body = encodeURIComponent(
                `From: ${payload.name} (${payload.email})\nType: ${payload.type}\n\n${payload.message}`
            );
            window.location.href = `mailto:hello@lukeberetta.com?subject=${subject}&body=${body}`;
            setStatus("success");
            return;
        }

        try {
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setStatus("success");
            } else {
                const data = await res.json().catch(() => ({}));
                setErrorMsg(data?.error ?? "Submission failed. Please try again.");
                setStatus("error");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <MessageSquare size={18} className="text-accent" />
                        <h3 className="text-base font-semibold text-text-1">Send Feedback</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={status === "sending"}
                        className="text-text-3 hover:text-text-1 transition-colors disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {status === "success" ? (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-4 py-8 text-center"
                        >
                            <div className="w-14 h-14 rounded-full bg-positive/10 flex items-center justify-center">
                                <CheckCircle size={28} className="text-positive" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-text-1 mb-1">Thanks for the feedback!</p>
                                <p className="text-sm text-text-3">We read every submission and use it to make WealthVue better.</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="mt-2 px-5 py-2 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent/90 transition-colors"
                            >
                                Done
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Type selector */}
                            <div>
                                <label className="block text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">
                                    Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {FEEDBACK_TYPES.map(t => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setType(t.value)}
                                            className={cn(
                                                "flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150",
                                                type === t.value
                                                    ? "border-accent bg-accent-light text-accent"
                                                    : "border-border bg-surface-2 text-text-2 hover:border-border/80 hover:bg-surface-2/80"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-xs font-semibold",
                                                type === t.value ? "text-accent" : "text-text-1"
                                            )}>
                                                {t.label}
                                            </span>
                                            <span className="text-[10px] mt-0.5 text-text-3 leading-tight">{t.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* From — read-only display */}
                            {user && (
                                <div>
                                    <label className="block text-xs font-semibold text-text-3 uppercase tracking-wider mb-2">
                                        From
                                    </label>
                                    <div className="bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-2">
                                        {user.displayName} · <span className="text-text-3">{user.email}</span>
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-semibold text-text-3 uppercase tracking-wider mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="What's on your mind?"
                                    rows={5}
                                    required
                                    disabled={status === "sending"}
                                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none disabled:opacity-50 transition-colors"
                                />
                            </div>

                            {/* Error */}
                            {status === "error" && (
                                <div className="flex items-center gap-2 text-negative text-sm bg-negative/5 px-4 py-3 rounded-xl">
                                    <AlertCircle size={15} />
                                    {errorMsg}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={status === "sending"}
                                    className="px-4 py-2 text-sm text-text-3 hover:text-text-1 transition-colors disabled:opacity-40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!message.trim() || status === "sending"}
                                    className="flex items-center gap-2 px-5 py-2 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={14} />
                                    {status === "sending" ? "Sending…" : "Send Feedback"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
