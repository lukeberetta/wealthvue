import { useEffect, useState } from "react";
import { useMotionValue, animate } from "motion/react";

interface AnimatedNumberProps {
    value: number;
    format: (n: number) => string;
    className?: string;
}

export const AnimatedNumber = ({ value, format, className }: AnimatedNumberProps) => {
    const motionValue = useMotionValue(0);
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            setDisplayValue(value);
            motionValue.set(value);
            return;
        }

        const controls = animate(motionValue, value, {
            duration: 1.2,
            ease: "easeOut",
        });

        const unsubscribe = motionValue.on("change", (v) => setDisplayValue(v));

        return () => {
            controls.stop();
            unsubscribe();
        };
    }, [value]);

    return <span className={className}>{format(displayValue)}</span>;
};
