import React from "react";

export const Footer = () => (
    <footer className="border-t border-border bg-bg">
        <div className="max-w-[1120px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

            <div className="flex items-center gap-2">
                <span className="font-serif text-sm text-accent font-semibold">WealthVue</span>
                <span className="text-border select-none">·</span>
                <span className="text-xs text-text-3">© {new Date().getFullYear()}</span>
            </div>

            <a
                href="https://www.lukeberetta.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-xs text-text-3 hover:text-text-1 transition-colors duration-200"
            >
                <span>crafted by</span>
                <span className="font-medium text-text-2 group-hover:text-accent transition-colors duration-200">
                    Luke Beretta
                </span>
                <svg
                    viewBox="0 0 10 10"
                    className="w-2.5 h-2.5 text-text-3 group-hover:text-accent transition-colors duration-200 -translate-y-px"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2 8L8 2M4 2h4v4" />
                </svg>
            </a>

        </div>
    </footer>
);
