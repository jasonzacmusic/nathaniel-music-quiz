"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Music, Star, Headphones, BookOpen, Check } from "lucide-react";
import { LINKS } from "@/config/links";
import { loadStats, getLevel } from "@/lib/gamification";

const PRESETS = [3, 5, 10, 20, 50];

const PERKS = [
  { icon: <Music className="w-5 h-5" />, text: "All quizzes stay free for everyone" },
  { icon: <BookOpen className="w-5 h-5" />, text: "Funds new lessons and quiz content" },
  { icon: <Headphones className="w-5 h-5" />, text: "Supports real music education" },
  { icon: <Star className="w-5 h-5" />, text: "Helps us reach more students worldwide" },
];

export default function SupportPage() {
  const [amount, setAmount] = useState(5);
  const [playerStats, setPlayerStats] = useState<{ level: string; icon: string; xp: number; quizzes: number } | null>(null);

  useEffect(() => {
    const stats = loadStats();
    if (stats.quizzesCompleted > 0) {
      const level = getLevel(stats.xp);
      setPlayerStats({ level: level.name, icon: level.icon, xp: stats.xp, quizzes: stats.quizzesCompleted });
    }
  }, []);

  // PayPal.me with amount, or fallback to donation link
  const paypalUrl = `${LINKS.paypal}/${amount}USD`;

  return (
    <main className="min-h-screen bg-[#0a0a08] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px] opacity-15 bg-gradient-to-b from-amber-500 to-orange-600" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 bg-violet-500" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-5 pt-24 pb-20 sm:pt-32">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors text-sm mb-12">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Home
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/25 mb-6">
            <Heart className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="font-display font-700 text-4xl sm:text-5xl leading-tight mb-4">
            <span className="text-white">Support</span>{" "}
            <span style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Our Mission
            </span>
          </h1>
          <p className="text-stone-400 text-base leading-relaxed max-w-sm mx-auto">
            Every quiz you take is free. Help us keep it that way and create more lessons for musicians everywhere.
          </p>
        </motion.div>

        {/* Player stats — personal touch */}
        {playerStats && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-8 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
            <p className="text-stone-500 text-sm">
              You&apos;ve completed <span className="text-white font-display font-700">{playerStats.quizzes}</span> quizzes
              and earned <span className="text-amber-400 font-display font-700">{playerStats.xp} XP</span> as a{" "}
              <span className="text-white">{playerStats.icon} {playerStats.level}</span>
            </p>
          </motion.div>
        )}

        {/* ═══ Pay What You Want — Bandcamp style ═══ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-10 p-6 sm:p-8 rounded-3xl border-2 border-amber-500/20 bg-gradient-to-b from-amber-500/[0.06] to-transparent">

          {/* Amount display */}
          <div className="text-center mb-8">
            <p className="text-stone-500 text-xs uppercase tracking-[0.2em] font-medium mb-3">Pay what you want</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-stone-500 text-3xl font-display font-700">$</span>
              <motion.span
                key={amount}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl sm:text-8xl font-display font-700 text-amber-400 tabular-nums leading-none"
              >
                {amount}
              </motion.span>
            </div>
            <p className="text-stone-600 text-xs mt-2">USD &middot; one-time</p>
          </div>

          {/* Slider */}
          <div className="mb-6 px-2">
            <input
              type="range"
              min="1"
              max="100"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              className="support-slider w-full h-2.5 appearance-none bg-white/[0.06] rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-700 mt-2 px-0.5">
              <span>$1</span>
              <span>$25</span>
              <span>$50</span>
              <span>$100</span>
            </div>
            <style jsx>{`
              .support-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: 3px solid rgba(255,255,255,0.2);
                box-shadow: 0 0 20px rgba(245,158,11,0.4), 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: box-shadow 0.2s;
              }
              .support-slider::-webkit-slider-thumb:hover {
                box-shadow: 0 0 30px rgba(245,158,11,0.6), 0 2px 8px rgba(0,0,0,0.3);
              }
              .support-slider::-moz-range-thumb {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: 3px solid rgba(255,255,255,0.2);
                box-shadow: 0 0 20px rgba(245,158,11,0.4);
                cursor: pointer;
              }
              .support-slider::-webkit-slider-runnable-track {
                height: 10px;
                border-radius: 5px;
                background: linear-gradient(to right,
                  rgba(245,158,11,0.15) 0%,
                  rgba(245,158,11,0.3) ${amount}%,
                  rgba(255,255,255,0.04) ${amount}%,
                  rgba(255,255,255,0.04) 100%);
              }
              .support-slider::-moz-range-track {
                height: 10px;
                border-radius: 5px;
                background: rgba(255,255,255,0.06);
                border: none;
              }
            `}</style>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 justify-center mb-8">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={`px-4 py-2 rounded-xl text-sm font-display font-600 transition-all ${
                  amount === p
                    ? "bg-amber-500/20 border-2 border-amber-400/40 text-amber-300"
                    : "bg-white/[0.03] border-2 border-white/[0.06] text-stone-400 hover:border-white/15 hover:text-stone-200"
                }`}
              >
                ${p}
              </button>
            ))}
          </div>

          {/* PayPal button */}
          <a
            href={paypalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 rounded-2xl font-display font-700 text-lg text-center text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #b45309, #92400e)",
              boxShadow: "0 0 40px rgba(180,83,9,0.3), 0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.533-1.017 2.46-2.646 2.46-4.85 0-1.627-.576-2.906-1.664-3.793C20.115.513 18.256 0 15.808 0h-.018c.19.167.37.353.537.56 1.15 1.424 1.476 3.243 1.072 5.613-.02.112-.04.227-.063.344-.997 5.094-4.457 6.814-8.85 6.814h-.062l-.04.247-.666 4.22-.335 2.127a.64.64 0 0 0 .633.74h3.38c.458 0 .849-.334.921-.786l.038-.19.73-4.632.047-.255a.933.933 0 0 1 .921-.786h.58c3.76 0 6.705-1.528 7.566-5.946.36-1.847.174-3.388-.777-4.473z"/>
              </svg>
              Pay ${amount} with PayPal
            </span>
          </a>

          <p className="text-center text-stone-700 text-xs mt-3">
            Secure payment via PayPal &middot; No account needed
          </p>
        </motion.div>

        {/* Or Patreon */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-10 text-center">
          <p className="text-stone-600 text-xs uppercase tracking-[0.2em] font-medium mb-3">Or become a monthly patron</p>
          <a
            href={LINKS.patreon}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl border-2 border-orange-500/25 bg-orange-500/[0.06] hover:bg-orange-500/[0.12] text-orange-300 font-display font-600 text-sm transition-all"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
            </svg>
            Support on Patreon
          </a>
        </motion.div>

        {/* What your support does */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mb-10">
          <h2 className="font-display font-700 text-lg text-white mb-4 text-center">What your support does</h2>
          <div className="space-y-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                  {perk.icon}
                </div>
                <p className="text-stone-300 text-sm">{perk.text}</p>
                <Check className="w-4 h-4 text-emerald-500/50 flex-shrink-0 ml-auto" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center border-t border-white/[0.04] pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/nsm-logo.png" alt="NSM" width={20} height={20} className="object-contain opacity-40" />
            <span className="text-stone-600 text-xs font-display">Nathaniel School of Music</span>
          </div>
          <p className="text-stone-700 text-xs">
            Every contribution, big or small, makes a difference.
          </p>
        </div>
      </div>
    </main>
  );
}
