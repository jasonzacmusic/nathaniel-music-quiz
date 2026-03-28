"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  questionCount: number;
  icon: string;
  color: string;
  href?: string;
}

export default function CategoryCard({
  name,
  questionCount,
  icon,
  color,
  href = "#",
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="flex-shrink-0"
    >
      <Link href={href}>
        <div
          className={`relative w-64 md:w-80 h-40 rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-br ${color} shadow-lg hover:shadow-2xl transition-shadow duration-300`}
        >
          {/* Content Container */}
          <div className="relative h-full p-6 md:p-8 flex flex-col justify-between">
            {/* Icon and Title */}
            <div>
              <motion.div
                className="text-5xl md:text-6xl mb-4 inline-block"
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {icon}
              </motion.div>
              <h3 className="font-display font-700 text-2xl md:text-3xl text-white mb-2 leading-tight">
                {name}
              </h3>
              <p className="text-white/80 text-sm md:text-base font-medium">
                {questionCount} questions
              </p>
            </div>

            {/* Call to Action */}
            <motion.div
              className="flex items-center gap-2 text-white font-medium"
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>Start Quiz</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </div>

          {/* Gradient Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/20 pointer-events-none"
          />

          {/* Shine Effect */}
          <motion.div
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          />
        </div>
      </Link>
    </motion.div>
  );
}
