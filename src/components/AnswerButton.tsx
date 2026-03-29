"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface AnswerButtonProps {
  text: string;
  onClick: () => void;
  state?: "default" | "selected" | "correct" | "wrong" | "reveal";
  index?: number;
  disabled?: boolean;
}

const LABELS = ["A", "B", "C", "D", "E"];

const stateStyles = {
  default: {
    container: "border-white/15 bg-black/40 backdrop-blur-md hover:bg-white/10 hover:border-white/25",
    label: "bg-white/10 text-white/60 group-hover:bg-white/15 group-hover:text-white",
    text: "text-white/90",
  },
  selected: {
    container: "border-violet-500/60 bg-violet-500/20 backdrop-blur-md",
    label: "bg-violet-500/30 text-violet-200",
    text: "text-violet-100",
  },
  correct: {
    container: "border-emerald-400/70 bg-emerald-400/15 backdrop-blur-md",
    label: "bg-emerald-400/30 text-emerald-200",
    text: "text-emerald-100",
  },
  wrong: {
    container: "border-rose-500/70 bg-rose-500/15 backdrop-blur-md",
    label: "bg-rose-500/30 text-rose-200",
    text: "text-rose-100",
  },
  reveal: {
    container: "border-amber-400/70 bg-amber-400/15 backdrop-blur-md",
    label: "bg-amber-400/30 text-amber-200",
    text: "text-amber-100",
  },
};

export default function AnswerButton({
  text,
  onClick,
  state = "default",
  index = 0,
  disabled = false,
}: AnswerButtonProps) {
  const styles = stateStyles[state];
  const label = LABELS[index] || String(index + 1);

  const shakeAnimation = state === "wrong" ? {
    x: [0, -8, 8, -5, 5, 0],
    transition: { duration: 0.45, times: [0, 0.1, 0.3, 0.5, 0.7, 1] },
  } : {};

  const bounceAnimation = state === "correct" ? {
    y: [0, -4, 0],
    transition: { duration: 0.35 },
  } : {};

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, x: -12 }}
      animate={{
        opacity: 1,
        x: 0,
        ...shakeAnimation,
        ...bounceAnimation,
      }}
      transition={{
        opacity: { duration: 0.3, delay: index * 0.06, ease: "easeOut" },
        x: { duration: 0.3, delay: index * 0.06, ease: "easeOut" },
      }}
      whileHover={state === "default" && !disabled ? { x: 4, scale: 1.01 } : {}}
      whileTap={state === "default" && !disabled ? { scale: 0.98 } : {}}
      className={`group relative w-full flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5 rounded-xl border transition-all duration-200 ${styles.container} ${
        disabled && state === "default" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Label badge */}
      <span
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-display font-700 text-xs sm:text-sm flex-shrink-0 transition-all duration-200 ${styles.label}`}
      >
        {state === "correct" ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <Check className="w-4 h-4" />
          </motion.div>
        ) : state === "wrong" ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <X className="w-4 h-4" />
          </motion.div>
        ) : state === "reveal" ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        ) : (
          label
        )}
      </span>

      {/* Answer text */}
      <span className={`flex-1 text-left font-medium text-sm leading-snug ${styles.text}`}>
        {text}
      </span>
    </motion.button>
  );
}
