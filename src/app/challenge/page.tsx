"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCategories } from "@/lib/queries";
import type { Category } from "@/lib/queries";
import { Zap, ChevronDown } from "lucide-react";

export default function ChallengePage() {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        // Default: select all categories
        setSelectedCategories(data.map((c) => c.category));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleStartChallenge = async () => {
    setIsStarting(true);

    const categoriesParam = selectedCategories.length > 0
      ? selectedCategories.map(encodeURIComponent).join(",")
      : "";

    const url = `/quiz/challenge?count=${questionCount}${categoriesParam ? `&categories=${categoriesParam}` : ""}`;
    router.push(url);
  };

  const questionOptions = [5, 10, 15, 25];

  return (
    <main className="bg-dark-bg text-slate-100 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display font-700 text-5xl md:text-6xl mb-4">
            <span className="bg-gradient-to-r from-white via-purple-300 to-purple-500 bg-clip-text text-transparent">
              Build Your Challenge
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Customize your quiz experience with the perfect combination of difficulty and topics
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          className="glass rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Question Count Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-purple-400" />
              <h2 className="font-display font-700 text-2xl">Question Count</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {questionOptions.map((option) => (
                <motion.button
                  key={option}
                  onClick={() => setQuestionCount(option)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-4 px-6 rounded-lg font-display font-600 text-lg transition-all ${
                    questionCount === option
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            <p className="text-slate-400 text-sm mt-4">
              Estimated time: {Math.ceil(questionCount * 0.75)} minutes
            </p>
          </div>

          {/* Categories Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ChevronDown className="w-6 h-6 text-orange-400" />
              <h2 className="font-display font-700 text-2xl">Categories</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {categories.map((category) => (
                    <motion.button
                      key={category.category}
                      onClick={() => toggleCategory(category.category)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg text-left transition-all ${
                        selectedCategories.includes(category.category)
                          ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                      }`}
                    >
                      <div className="font-display font-600">{category.category}</div>
                      <div className="text-sm opacity-90">{category.count} questions</div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() =>
                      setSelectedCategories(categories.map((c) => c.category))
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                  >
                    Select All
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedCategories([])}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                  >
                    Clear All
                  </motion.button>
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div>
              <div className="text-slate-400 text-sm mb-1">Questions</div>
              <div className="font-display font-700 text-2xl text-purple-400">{questionCount}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Categories</div>
              <div className="font-display font-700 text-2xl text-orange-400">
                {selectedCategories.length || "All"}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            onClick={handleStartChallenge}
            disabled={isStarting || (selectedCategories.length === 0 && categories.length > 0)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 px-6 rounded-lg font-display font-700 text-lg flex items-center justify-center gap-2 transition-all ${
              isStarting || (selectedCategories.length === 0 && categories.length > 0)
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/50"
            }`}
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Starting...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Start Challenge
              </>
            )}
          </motion.button>

          {selectedCategories.length === 0 && categories.length > 0 && (
            <p className="text-center text-red-400 text-sm mt-4">
              Please select at least one category
            </p>
          )}
        </motion.div>

        {/* Tips Section */}
        <motion.div
          className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 to-orange-900/20 border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="font-display font-700 text-lg mb-3 text-purple-300">Tips for Success</h3>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex gap-2">
              <span className="text-purple-400">•</span>
              Start with 5-10 questions to get comfortable
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">•</span>
              Mix multiple categories to build well-rounded skills
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400">•</span>
              Longer challenges are perfect for focused practice sessions
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">•</span>
              Track your progress and gradually increase difficulty
            </li>
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
