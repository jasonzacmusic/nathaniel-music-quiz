"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

interface Category {
  category: string;
  count: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  piano: "🎹", bass: "🎸", chord: "🎵", rhythm: "🥁",
  scale: "🎼", mode: "🎼", interval: "🎯", theory: "📖",
  composition: "✍️", ear: "👂",
};

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (n.includes(key)) return icon;
  }
  return "🎵";
}

const QUESTION_OPTIONS = [
  { count: 5, label: "Quick", desc: "~4 min", color: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/25", active: "bg-cyan-500/20 border-cyan-400/50 text-cyan-200" },
  { count: 10, label: "Standard", desc: "~8 min", color: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/25", active: "bg-violet-500/20 border-violet-400/50 text-violet-200" },
  { count: 15, label: "Deep", desc: "~12 min", color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/25", active: "bg-amber-500/20 border-amber-400/50 text-amber-200" },
  { count: 25, label: "Marathon", desc: "~20 min", color: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/25", active: "bg-rose-500/20 border-rose-400/50 text-rose-200" },
];

export default function ChallengePage() {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        const data: Category[] = json.data || [];
        setCategories(data);
        setSelectedCategories(data.map((c) => c.category));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleStart = () => {
    setIsStarting(true);
    const cats = selectedCategories.map(encodeURIComponent).join(",");
    router.push(`/quiz/challenge?count=${questionCount}${cats ? `&categories=${cats}` : ""}`);
  };

  const canStart = !isStarting && !(selectedCategories.length === 0 && categories.length > 0);

  return (
    <main className="bg-[#080D1A] text-slate-100 min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.05] mb-6">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] text-violet-400 font-medium uppercase tracking-[0.14em]">Custom Challenge</span>
          </div>
          <h1 className="font-display font-700 text-4xl md:text-6xl leading-tight mb-4">
            <span className="text-white">Build Your</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #c4b5fd, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Quiz
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed">
            Pick how many questions and which topics. We&apos;ll build it on the spot.
          </p>
        </motion.div>

        {/* Question Count */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="font-display font-700 text-sm uppercase tracking-widest text-slate-500 mb-4">
            Length
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUESTION_OPTIONS.map((opt) => {
              const isSelected = questionCount === opt.count;
              return (
                <motion.button
                  key={opt.count}
                  onClick={() => setQuestionCount(opt.count)}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className={`py-4 px-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? opt.active
                      : `bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] text-slate-300`
                  }`}
                >
                  <div className="font-display font-700 text-2xl mb-0.5">{opt.count}</div>
                  <div className="text-xs font-medium opacity-80">{opt.label}</div>
                  <div className="text-[10px] opacity-50 mt-0.5">{opt.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-700 text-sm uppercase tracking-widest text-slate-500">
              Topics
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategories(categories.map((c) => c.category))}
                className="text-[11px] text-slate-500 hover:text-violet-400 transition-colors font-medium"
              >
                All
              </button>
              <span className="text-slate-700">·</span>
              <button
                onClick={() => setSelectedCategories([])}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors font-medium"
              >
                None
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat, i) => {
                const isSelected = selectedCategories.includes(cat.category);
                return (
                  <motion.button
                    key={cat.category}
                    onClick={() => toggleCategory(cat.category)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                      isSelected
                        ? "bg-violet-500/[0.10] border-violet-500/30 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/12 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-xl">{getCategoryIcon(cat.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-600 text-sm truncate">{cat.category}</div>
                      <div className="text-[11px] opacity-50">{cat.count} questions</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-violet-500 border-violet-400"
                        : "border-white/20"
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Summary + Start */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          {/* Summary strip */}
          <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">Questions</div>
                <div className="font-display font-700 text-lg text-violet-400">{questionCount}</div>
              </div>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">Topics</div>
                <div className="font-display font-700 text-lg text-amber-400">
                  {selectedCategories.length === categories.length ? "All" : selectedCategories.length || "—"}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-600">~{Math.ceil(questionCount * 0.75)} min</div>
          </div>

          {/* Start button */}
          <motion.button
            onClick={handleStart}
            disabled={!canStart}
            whileHover={canStart ? { scale: 1.02, y: -2 } : {}}
            whileTap={canStart ? { scale: 0.98 } : {}}
            className="w-full py-5 rounded-xl font-display font-700 text-lg flex items-center justify-center gap-3 transition-all"
            style={canStart ? {
              background: "linear-gradient(135deg, #7C3AED, #4C1D95, #06b6d4)",
              boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 4px 24px rgba(0,0,0,0.3)",
              color: "white",
            } : {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.3)",
              cursor: "not-allowed",
            }}
          >
            {isStarting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Building your quiz...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Start Challenge
              </>
            )}
          </motion.button>

          {selectedCategories.length === 0 && categories.length > 0 && (
            <p className="text-center text-rose-400 text-xs mt-3">
              Select at least one topic to continue
            </p>
          )}
        </motion.div>
      </div>
    </main>
  );
}
