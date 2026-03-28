"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  questionCount: number;
  icon: string;
  color: string;
  href: string;
}

export default function CategoryCard({
  name,
  questionCount,
  icon,
  color,
  href,
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer h-full"
      >
        {/* Subtle gradient glow on hover */}
        <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${color} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

        <div className="relative flex items-start gap-4">
          <span className="text-3xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-display font-600 text-base text-white truncate group-hover:text-white/90 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {questionCount} {questionCount === 1 ? "question" : "questions"}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
