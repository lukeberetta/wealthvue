import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Briefcase, Coins, Car, Home, Wallet, MoreHorizontal,
    AlertCircle, ChevronDown, Check, X, ImagePlus, ArrowRight,
    ShieldAlert, MessageSquareText, Pencil
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Asset } from "../../../types";
import { formatCurrency, cn } from "../../../lib/utils";
import { AssetIcon } from "./AssetIcon";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInputTextChange: (text: string) => void;
    isAnalyzing: boolean;
    inputText: string;
    analysisError?: string | null;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAnalyze: () => void;
    draftAssets: Partial<Asset>[];
    onUpdateDraft: (index: number, updated: Partial<Asset>) => void;
    onDiscardDrafts: () => void;
    onSaveDrafts: () => void;
    displayCurrency: string;
}

type InputMode = "text" | "image";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ANALYSIS_MESSAGES = [
    "Reading your input…",
    "Identifying the asset…",
    "Checking market data…",
    "Estimating current value…",
    "Finalising results…",
];

const CONFIDENCE_CONFIG = {
    high: { label: "High confidence", cls: "text-positive bg-positive/10 border-positive/20" },
    medium: { label: "Medium confidence", cls: "text-amber-600 bg-amber-50 border-amber-200" },
    low: { label: "Low confidence", cls: "text-negative bg-negative/10 border-negative/20" },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Minimal spinner */
function AnalysisOrb() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        </div>
    );
}

/** Cycling messages */
function AnalysisMessages({ reduced }: { reduced: boolean }) {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setIndex(i => (i + 1) % ANALYSIS_MESSAGES.length), 2200);
        return () => clearInterval(id);
    }, []);

    if (reduced) return <p className="text-sm text-text-2 text-center">{ANALYSIS_MESSAGES[index]}</p>;

    return (
        <div className="h-6 overflow-hidden relative">
            <AnimatePresence mode="wait">
                <motion.p key={index}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.32 }}
                    className="text-sm text-text-2 text-center absolute inset-x-0"
                >
                    {ANALYSIS_MESSAGES[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}

/** Inline editable number field */
function EditableNumber({
    value,
    currency,
    label,
    onChange,
}: {
    value: number;
    currency: string;
    label?: string;
    onChange: (n: number) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [raw, setRaw] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    const commit = () => {
        // Allow negative values (e.g. credit card debt: -5000)
        const parsed = parseFloat(raw.replace(/[^0-9.\-]/g, ""));
        if (!isNaN(parsed)) onChange(parsed);
        setEditing(false);
    };

    return (
        <div className="text-right">
            {label && <p className="text-[9px] text-text-3 font-bold uppercase tracking-widest mb-0.5">{label}</p>}
            {editing ? (
                <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] text-text-3">{currency}</span>
                    <input
                        ref={inputRef}
                        value={raw}
                        onChange={e => setRaw(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
                        className="w-20 text-right font-medium text-sm text-text-1 bg-transparent border-b border-accent/50 focus:outline-none tabular-nums"
                    />
                </div>
            ) : (
                <button
                    onClick={() => { setRaw(String(value)); setEditing(true); }}
                    className="group flex items-center justify-end gap-1 text-right"
                    title={`Edit ${label || "value"}`}
                >
                    <span className="font-medium text-sm tabular-nums text-text-1 group-hover:text-accent transition-colors">
                        {formatCurrency(value, currency)}
                    </span>
                    <Pencil size={10} className="text-text-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
            )}
        </div>
    );
}

/** Draft card with editable pricing */
function DraftCard({
    asset,
    index,
    displayCurrency,
    reduced,
    onUpdate,
}: {
    asset: Partial<Asset>;
    index: number;
    displayCurrency: string;
    reduced: boolean;
    onUpdate: (updated: Partial<Asset>) => void;
}) {
    const [nameEditing, setNameEditing] = useState(false);
    const [name, setName] = useState(asset.name ?? "");
    const [rationaleOpen, setRationaleOpen] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (nameEditing) nameInputRef.current?.focus(); }, [nameEditing]);

    const confidence = asset.aiConfidence ?? "medium";
    const conf = CONFIDENCE_CONFIG[confidence];
    const priceCurrency = asset.unitPriceCurrency ?? displayCurrency;
    const totalCurrency = asset.totalValueCurrency ?? displayCurrency;
    const qty = asset.quantity ?? 1;

    const handleUnitPriceChange = (newUnitPrice: number) => {
        onUpdate({ ...asset, unitPrice: newUnitPrice, totalValue: newUnitPrice * qty });
    };
    const handleTotalValueChange = (newTotal: number) => {
        onUpdate({ ...asset, totalValue: newTotal, unitPrice: qty > 0 ? newTotal / qty : newTotal });
    };

    return (
        <motion.div
            initial={reduced ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
            className={cn(
                "flex flex-col py-3.5 px-4 rounded-xl transition-colors",
                index % 2 !== 0 && "bg-surface-2/40"
            )}
        >
            {/* Main row */}
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-accent shrink-0">
                    <AssetIcon asset={asset} size={14} />
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                    <div className="group cursor-text" onClick={() => setNameEditing(true)}>
                        {nameEditing ? (
                            <input
                                ref={nameInputRef}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onBlur={() => { setNameEditing(false); onUpdate({ ...asset, name }); }}
                                onKeyDown={e => { if (e.key === "Enter") { setNameEditing(false); onUpdate({ ...asset, name }); } }}
                                className="font-medium text-sm text-text-1 bg-transparent border-b border-accent/40 focus:outline-none w-full"
                            />
                        ) : (
                            <h3 className="font-medium text-sm text-text-1 group-hover:text-accent transition-colors truncate">
                                {name}
                                <span className="ml-1 opacity-0 group-hover:opacity-40 transition-opacity font-sans font-normal text-xs">✎</span>
                            </h3>
                        )}
                    </div>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5">
                        <span className="text-[10px] text-text-3 font-medium capitalize">{asset.assetType}</span>
                        {asset.ticker && (
                            <>
                                <span className="text-text-3/40 text-[10px]">•</span>
                                <span className="text-[10px] font-bold text-accent bg-accent-light/60 px-1 rounded-sm">{asset.ticker}</span>
                            </>
                        )}
                        {qty > 1 && (
                            <>
                                <span className="text-text-3/40 text-[10px]">•</span>
                                <span className="text-[10px] text-text-3 tabular-nums">{qty} units</span>
                            </>
                        )}
                        {confidence !== "high" && (
                            <>
                                <span className="text-text-3/40 text-[10px]">•</span>
                                <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border", conf.cls)}>
                                    {conf.label}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Editable pricing */}
                <div className="shrink-0 flex gap-4 items-center justify-end">
                    {qty > 1 && (
                        <EditableNumber
                            value={asset.unitPrice ?? 0}
                            currency={priceCurrency}
                            label="Per unit"
                            onChange={handleUnitPriceChange}
                        />
                    )}
                    <EditableNumber
                        value={asset.totalValue ?? 0}
                        currency={totalCurrency}
                        label={qty > 1 ? "Total" : undefined}
                        onChange={handleTotalValueChange}
                    />
                </div>

                {/* Rationale Toggle */}
                {asset.aiRationale && (
                    <button
                        onClick={() => setRationaleOpen(o => !o)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-text-3 hover:bg-surface-2 hover:text-text-1 ml-1 shrink-0 transition-colors"
                        title="AI Reasoning"
                    >
                        <MessageSquareText size={13} className={rationaleOpen ? "text-accent" : ""} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {rationaleOpen && asset.aiRationale && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 ml-11 text-xs text-text-2 bg-surface-2/40 p-3 rounded-lg border border-border/50 leading-relaxed">
                            {asset.aiRationale}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AddAssetModal = ({
    isOpen,
    onClose,
    isAnalyzing,
    inputText,
    onInputTextChange,
    analysisError,
    onFileUpload,
    onAnalyze,
    draftAssets,
    onUpdateDraft,
    onDiscardDrafts,
    onSaveDrafts,
    displayCurrency,
}: AddAssetModalProps) => {
    const reduced = useReducedMotion() ?? false;

    const [inputMode, setInputMode] = useState<InputMode>("text");
    const [isDragOver, setIsDragOver] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const state: "input" | "analyzing" | "result" =
        isAnalyzing ? "analyzing" :
            draftAssets.length > 0 ? "result" : "input";

    const hasText = inputText.trim().length > 0;
    const hasImage = !!imagePreview;
    const canSubmit = inputMode === "text" ? hasText : hasImage;

    // Autofocus on open
    useEffect(() => {
        if (isOpen && state === "input" && inputMode === "text") {
            setTimeout(() => textareaRef.current?.focus(), 120);
        }
    }, [isOpen, state, inputMode]);

    // Auto-grow textarea
    const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const el = e.target;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
        onInputTextChange(el.value);
    }, [onInputTextChange]);

    // ⌘+Enter submit
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (canSubmit && !isAnalyzing) onAnalyze();
        }
    }, [canSubmit, isAnalyzing, onAnalyze]);

    // Drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
    const handleDragLeave = useCallback(() => setIsDragOver(false), []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        const dt = new DataTransfer(); dt.items.add(file);
        onFileUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
    }, [onFileUpload]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onload = () => setImagePreview(r.result as string); r.readAsDataURL(file); }
        onFileUpload(e);
    }, [onFileUpload]);

    // ESC
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (state === "result") { if (window.confirm("Discard results and go back?")) onDiscardDrafts(); }
            else if (state === "input") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, state, onClose, onDiscardDrafts]);

    useEffect(() => { if (!isOpen) setImagePreview(null); }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(10,8,6,0.55)" }}
            onClick={e => { if (e.target === e.currentTarget && state === "input") onClose(); }}
        >
            <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />

            <AnimatePresence mode="wait">
                <motion.div
                    key="modal-shell"
                    initial={reduced ? {} : { opacity: 0, scale: 0.96, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={reduced ? {} : { opacity: 0, scale: 0.96, y: 24 }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="relative bg-surface w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden z-10"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Add Asset"
                >
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-7 pt-7 pb-0">
                        <div>
                            <h2 className="font-serif text-2xl text-text-1">Add Asset</h2>
                            <p className="text-xs text-text-3 mt-0.5 font-medium">
                                {state === "input" && "Describe your asset or upload a screenshot"}
                                {state === "analyzing" && "AI is thinking…"}
                                {state === "result" && `${draftAssets.length} asset${draftAssets.length !== 1 ? "s" : ""} found — review and adjust before saving`}
                            </p>
                        </div>
                        <button
                            id="add-asset-close"
                            onClick={() => {
                                if (state === "result") { if (window.confirm("Discard results?")) { onDiscardDrafts(); onClose(); } }
                                else onClose();
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* ── Body ── */}
                    <AnimatePresence mode="wait">

                        {/* ═══════════ STATE 1: INPUT ═══════════ */}
                        {state === "input" && (
                            <motion.div
                                key="input"
                                initial={reduced ? {} : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={reduced ? {} : { opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-7 pt-6 pb-7 space-y-5"
                            >
                                {/* Mode toggle — pill switcher */}
                                <div className="flex bg-surface-2 rounded-2xl p-1 gap-1">
                                    {(["text", "image"] as InputMode[]).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setInputMode(mode)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                                                inputMode === mode
                                                    ? "bg-surface text-text-1 shadow-sm"
                                                    : "text-text-3 hover:text-text-2"
                                            )}
                                        >
                                            {mode === "text"
                                                ? <><MessageSquareText size={15} /> Describe</>
                                                : <><ImagePlus size={15} /> Upload screenshot</>
                                            }
                                        </button>
                                    ))}
                                </div>

                                {/* ── TEXT MODE ── */}
                                <AnimatePresence mode="wait">
                                    {inputMode === "text" && (
                                        <motion.div
                                            key="text-mode"
                                            initial={reduced ? {} : { opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={reduced ? {} : { opacity: 0, x: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative"
                                        >
                                            <textarea
                                                ref={textareaRef}
                                                id="add-asset-input"
                                                value={inputText}
                                                onChange={handleTextareaInput}
                                                onKeyDown={handleKeyDown}
                                                disabled={isAnalyzing}
                                                rows={4}
                                                placeholder={"Tell me about an asset…\ne.g. \"15 Apple shares\" or \"2021 Toyota Corolla, 42 000 km\""}
                                                className="w-full resize-none bg-surface-2/50 border border-border rounded-2xl text-text-1 placeholder:text-text-3 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/20 p-4 transition-all duration-300"
                                                style={{ minHeight: 100 }}
                                            />
                                            <AnimatePresence>
                                                {hasText && (
                                                    <motion.span
                                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className="absolute bottom-3 right-4 text-[10px] text-text-3 font-medium pointer-events-none select-none"
                                                    >
                                                        ⌘↵ to analyse
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}

                                    {/* ── IMAGE MODE ── */}
                                    {inputMode === "image" && (
                                        <motion.div
                                            key="image-mode"
                                            initial={reduced ? {} : { opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={reduced ? {} : { opacity: 0, x: 8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <label
                                                htmlFor="add-asset-file"
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={cn(
                                                    "relative flex flex-col items-center justify-center w-full rounded-2xl cursor-pointer overflow-hidden",
                                                    "border-2 border-dashed transition-all duration-300",
                                                    isDragOver
                                                        ? "border-accent bg-accent-light/20 scale-[1.01]"
                                                        : imagePreview
                                                            ? "border-border bg-surface-2/40"
                                                            : "border-border hover:border-accent/40 hover:bg-surface-2/50",
                                                )}
                                                style={{ minHeight: 140 }}
                                                aria-label="Upload screenshot"
                                            >
                                                {isDragOver && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/12 to-accent/5"
                                                        animate={{ x: ["-100%", "100%"] }}
                                                        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                                                    />
                                                )}

                                                {imagePreview ? (
                                                    <div className="relative w-full p-3">
                                                        <img src={imagePreview} alt="Preview"
                                                            className="w-full max-h-40 object-contain rounded-xl border border-border" />
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.preventDefault(); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                            className="absolute top-5 right-5 w-6 h-6 bg-surface rounded-full flex items-center justify-center text-text-3 hover:text-negative border border-border/60 transition-colors shadow-sm"
                                                            aria-label="Remove screenshot"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                        <p className="text-xs text-center text-text-3 mt-2 font-medium">AI will extract all visible assets</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                                            isDragOver ? "bg-accent-light text-accent" : "bg-surface-2 text-text-3"
                                                        )}>
                                                            <ImagePlus size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-text-2">
                                                                {isDragOver ? "Drop it here" : "Drag & drop or click to browse"}
                                                            </p>
                                                            <p className="text-xs text-text-3 mt-1">PNG, JPG, WEBP · up to 10 MB</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </label>
                                            <input
                                                id="add-asset-file"
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={handleFileInputChange}
                                                tabIndex={-1}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Error */}
                                <AnimatePresence>
                                    {analysisError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                            className="flex items-start gap-3 bg-negative/5 border border-negative/20 rounded-xl px-4 py-3"
                                        >
                                            <AlertCircle size={15} className="text-negative mt-0.5 shrink-0" />
                                            <p className="text-sm text-negative">{analysisError}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <button
                                    id="add-asset-analyze"
                                    onClick={onAnalyze}
                                    disabled={!canSubmit || isAnalyzing}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl",
                                        "text-sm font-semibold bg-accent text-white shadow-md shadow-accent/20",
                                        "hover:opacity-90 active:scale-[0.98] transition-all duration-200",
                                        "disabled:opacity-40 disabled:pointer-events-none"
                                    )}
                                >
                                    <span>Analyse with AI</span>
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}

                        {/* ═══════════ STATE 2: ANALYZING ═══════════ */}
                        {state === "analyzing" && (
                            <motion.div
                                key="analyzing"
                                initial={reduced ? {} : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={reduced ? {} : { opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-7 pt-4 pb-12 flex flex-col items-center gap-7"
                            >
                                <AnalysisOrb />
                                <div className="text-center space-y-2">
                                    <AnalysisMessages reduced={reduced} />
                                    <p className="text-[11px] text-text-3">Using live market data to estimate value</p>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════════ STATE 3: RESULT ═══════════ */}
                        {state === "result" && (
                            <motion.div
                                key="result"
                                initial={reduced ? {} : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={reduced ? {} : { opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="px-7 pt-5 pb-7 space-y-4"
                            >
                                <div className="max-h-[56vh] overflow-y-auto pr-0.5 -mr-0.5">
                                    {draftAssets.map((asset, i) => (
                                        <React.Fragment key={i}>
                                            <DraftCard
                                                asset={asset}
                                                index={i}
                                                displayCurrency={displayCurrency}
                                                reduced={reduced}
                                                onUpdate={(updated) => onUpdateDraft(i, updated)}
                                            />
                                        </React.Fragment>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        id="add-asset-discard"
                                        onClick={onDiscardDrafts}
                                        className="flex-1 py-3 rounded-2xl border border-border text-sm font-semibold text-text-2 hover:bg-surface-2 transition-colors"
                                    >
                                        Try again
                                    </button>
                                    <button
                                        id="add-asset-save"
                                        onClick={onSaveDrafts}
                                        className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200"
                                    >
                                        <Check size={16} />
                                        {draftAssets.length > 1 ? `Save all ${draftAssets.length} assets` : "Save to portfolio"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
