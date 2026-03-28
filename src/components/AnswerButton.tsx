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
    container: "border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20",
    label: "bg-white/[0.07] text-slate-400 group-hover:bg-white/[0.12] group-hover:text-white",
    text: "text-slate-200",
  },
  selected: {
    container: "border-violet-500/60 bg-violet-500/[0.12]",
    label: "bg-violet-500/30 text-violet-200",
    text: "text-violet-100",
  },
  correct: {
    container: "border-emerald-400/70 bg-emerald-400/[0.12]",
    label: "bg-emerald-400/30 text-emerald-200",
    text: "text-emerald-100",
  },
  wrong: {
    container: "border-rose-500/70 bg-rose-500/[0.10]",
    label: "bg-rose-500/30 text-rose-200",
    text: "text-rose-100",
  },
  reveal: {
    container: "border-amber-400/70 bg-amber-400/[0.10]",
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
        opacity: { duration: 0.35, delay: index * 0.08, ease: "easeOut" },
        x: { duration: 0.35, delay: index * 0.08, ease: "easeOut" },
      }}
      whileHover={state === "default" && !disabled ? { x: 4 } : {}}
      whileTap={state === "default" && !disabled ? { scale: 0.98 } : {}}
      className={`group relative w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 transition-all duration-200 ${styles.container} ${
        disabled && state === "default" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Label badge */}
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-700 text-sm flex-shrink-0 transition-all duration-200 ${styles.label}`}
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

      {/* Hover shimmer for default */}
      {state === "default" && !disabled && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-opacity duration-400" />
        </div>
      )}
    </motion.button>
  );
}
