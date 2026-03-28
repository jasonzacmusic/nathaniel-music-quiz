"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Flame, Crown } from "lucide-react";

export default function QuickPlay() {
  const quickPlayOptions = [
    {
      icon: Zap,
      title: "Quick Bite",
      description: "5 questions",
      href: "/quiz/random?count=5",
      color: "from-blue-600 to-blue-500",
      accentColor: "bg-blue-500/20",
      borderColor: "border-blue-500/50",
    },
    {
      icon: Flame,
      title: "Full Heat",
      description: "10 questions",
      href: "/quiz/random?count=10",
      color: "from-orange-600 to-orange-500",
      accentColor: "bg-orange-500/20",
      borderColor: "border-orange-500/50",
    },
    {
      icon: Crown,
      title: "Master Mode",
      description: "Custom Challenge",
      href: "/challenge",
      color: "from-purple-600 to-purple-500",
      accentColor: "bg-purple-500/20",
      borderColor: "border-purple-500/50",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-700 text-4xl md:text-5xl mb-4">
            <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Quick Play
            </span>
          </h2>
          <p className="text-slate-400 text-lg">Pick a mode and start testing your knowledge</p>
        </motion.div>

        {/* Quick Play Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {quickPlayOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Link key={index} href={option.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className={`relative h-64 rounded-2xl border-2 ${option.borderColor} overflow-hidden cursor-pointer group`}
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />

                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 ${option.accentColor}`}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Content */}
                  <div className="relative z-10 h-full p-6 md:p-8 flex flex-col items-center justify-center text-center">
                    {/* Icon */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${option.color} mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="font-display font-700 text-2xl mb-2">{option.title}</h3>

                    {/* Description */}
                    <p className="text-slate-300 text-sm mb-6">{option.description}</p>

                    {/* CTA */}
                    <motion.div
                      className={`px-6 py-2 rounded-lg bg-gradient-to-r ${option.color} text-white font-medium text-sm`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Play Now
                    </motion.div>
                  </div>

                  {/* Shine effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
