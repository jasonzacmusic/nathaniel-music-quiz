"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  questionCount: number;
  icon: string;
  color: string;
  href: string;
  index?: number;
}

// Simpler, bolder color system
const ACCENTS: Record<string, string> = {
  "from-violet-600 to-purple-500": "#8b5cf6",
  "from-blue-600 to-cyan-500": "#06B6D4",
  "from-emerald-600 to-teal-500": "#10b981",
  "from-orange-600 to-amber-500": "#f59e0b",
  "from-pink-600 to-rose-500": "#f43f5e",
  "from-indigo-600 to-blue-500": "#6366f1",
  "from-red-600 to-orange-500": "#ef4444",
  "from-purple-600 to-violet-500": "#a855f7",
};

export default function CategoryCard({
  name,
  questionCount,
  icon,
  color,
  href,
  index = 0,
}: CategoryCardProps) {
  const accent = ACCENTS[color] || "#8b5cf6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={href} className="group block">
        <div className="relative flex items-center gap-4 px-4 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 overflow-hidden">
          {/* Accent stripe left */}
          <div
            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: accent }}
          />

          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ml-2"
            style={{ backgroundColor: accent + "15" }}
          >
            {icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-700 text-[15px] text-white/90 group-hover:text-white leading-tight truncate transition-colors">
              {name}
            </h3>
            <p className="text-xs text-white/30 mt-0.5">{questionCount} questions</p>
          </div>

          {/* Arrow */}
          <svg
            className="w-4 h-4 text-white/15 group-hover:text-white/50 shrink-0 transition-all duration-300 group-hover:translate-x-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
