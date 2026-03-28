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

export default function AnswerButton({
  text,
  onClick,
  state = "default",
  index = 0,
  disabled = false,
}: AnswerButtonProps) {
  const getBackgroundStyle = () => {
    switch (state) {
      case "selected":
        return "bg-electric-violet/30 border-electric-violet/80";
      case "correct":
        return "bg-warm-amber/90 border-warm-amber text-dark-bg";
      case "wrong":
        return "bg-rose/90 border-rose text-white";
      case "reveal":
        return "bg-warm-amber/80 border-warm-amber/80 text-dark-bg animate-pulse-glow";
      default:
        return "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40";
    }
  };

  const containerAnimation = state === "wrong" ? {
    x: [-6, 6, -6, 0],
    transition: { duration: 0.4, times: [0, 0.33, 0.66, 1] },
  } : state === "correct" ? {
    scale: [1, 1.02, 1],
    transition: { duration: 0.3 },
  } : {};

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, ...containerAnimation }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={state === "default" && !disabled ? { scale: 1.02 } : {}}
      whileTap={state === "default" && !disabled ? { scale: 0.98 } : {}}
      className={`relative w-full min-h-14 px-6 py-4 rounded-2xl border-2 font-medium text-base transition-all duration-200 flex items-center justify-between group ${getBackgroundStyle()} ${
        disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"
      }`}
    >
      {/* Main Text */}
      <span className="flex-1 text-left">{text}</span>

      {/* State Icons */}
      {state === "correct" && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Check className="w-6 h-6" />
        </motion.div>
      )}

      {state === "wrong" && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <X className="w-6 h-6" />
        </motion.div>
      )}

      {state === "reveal" && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Check className="w-6 h-6" />
        </motion.div>
      )}

      {/* Hover Glow for Default State */}
      {state === "default" && !disabled && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300 pointer-events-none" />
      )}
    </motion.button>
  );
}
