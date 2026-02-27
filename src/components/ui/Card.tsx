import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className }: CardProps) => (
    <div className={cn("card p-6", className)}>{children}</div>
);
