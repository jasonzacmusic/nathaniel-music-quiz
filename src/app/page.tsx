import { getCategories, getQuizStats } from "@/lib/queries";
import HeroSection from "@/components/HeroSection";
import { LINKS } from "@/config/links";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories: { category: string; count: number }[] = [];
  let quizStats = { total_questions: 0, total_sets: 0, categories_count: 0 };
  try {
    const [cats, stats] = await Promise.all([getCategories(), getQuizStats()]);
    categories = cats;
    quizStats = stats;
  } catch {
    // DB unavailable — render with empty state
  }

  // Video quiz instrument categories — use real counts from DB
  const catCount = (name: string) => categories.find(c => c.category.toLowerCase() === name.toLowerCase())?.count || 0;
  const instrumentCategories = [
    {
      name: "Piano",
      count: catCount("Piano"),
      icon: (
        <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      gradient: "from-amber-600 to-orange-500",
      border: "border-amber-700/30 hover:border-amber-500/50",
      bg: "rgba(180,83,9,0.08)",
      topics: "Modes, chord degrees, jazz voicings, slash chords, secondary dominants",
    },
    {
      name: "Bass",
      count: catCount("Bass"),
      icon: (
        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ),
      gradient: "from-violet-600 to-purple-500",
      border: "border-violet-700/30 hover:border-violet-500/50",
      bg: "rgba(124,58,237,0.08)",
      topics: "Basslines, groove recognition, rhythmic feel",
    },
    {
      name: "Whistle",
      count: catCount("Whistle"),
      icon: (
        <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      ),
      gradient: "from-cyan-600 to-teal-500",
      border: "border-cyan-700/30 hover:border-cyan-500/50",
      bg: "rgba(6,182,212,0.08)",
      topics: "Tin whistle melodies, ornamental patterns",
    },
  ];

  return (
    <main className="bg-[#0a0a08] text-slate-100">
      <HeroSection
        stats={{
          totalQuestions: quizStats.total_questions,
          totalSets: quizStats.total_sets,
          categories: quizStats.categories_count,
        }}
        categories={categories.map((c) => ({ name: c.category, count: c.count }))}
      />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — "Watch. Listen. Answer." — Video Quizzes (THE STAR)
          ══════════════════════════════════════════════════════════════ */}
      <section id="categories" className="py-24 sm:py-32 px-6 lg:px-8 relative">
        {/* Subtle glow behind section */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(180,83,9,0.06),transparent)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-500/60 mb-4">
              The Original
            </p>
            <h2 className="font-display font-700 text-4xl sm:text-5xl md:text-6xl text-white leading-[1.08] mb-6">
              Video-Based Ear Training
            </h2>
            <p className="text-stone-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-300">
              Watch clips from real music lessons. Hear modes, chord degrees, time signatures, jazz extensions
              — live on the instrument. No MIDI, no synths.{" "}
              <span className="text-stone-300 font-500">Real musicianship.</span>
            </p>
          </div>

          {/* Instrument category cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {instrumentCategories.map((cat) => (
              <Link
                key={cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="group block"
              >
                <div
                  className={`relative rounded-2xl border ${cat.border} p-7 sm:p-8 transition-all duration-300 h-full overflow-hidden`}
                  style={{ background: `linear-gradient(135deg, ${cat.bg} 0%, transparent 100%)` }}
                >
                  {/* Hover glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: cat.bg }}
                  />

                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                      {cat.icon}
                    </div>

                    <div className="flex items-baseline gap-3 mb-2">
                      <h3 className="font-display font-700 text-2xl text-white">{cat.name}</h3>
                      <span className="text-sm text-stone-500 font-medium">{cat.count} questions</span>
                    </div>

                    <p className="text-stone-500 text-sm leading-relaxed mb-5">
                      {cat.topics}
                    </p>

                    <div className="flex items-center gap-1.5 text-amber-500/60 group-hover:text-amber-400 transition-colors text-xs font-medium">
                      Start quiz
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Prominent CTA */}
          <div className="text-center">
            <Link
              href="/challenge"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-display font-700 text-base text-white bg-amber-700 hover:bg-amber-600 transition-colors"
              style={{ boxShadow: "0 0 30px rgba(180,83,9,0.3), 0 4px 20px rgba(0,0,0,0.3)" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start a Video Quiz
            </Link>
            <p className="text-stone-600 text-xs mt-4">326 questions across {categories.length} topics</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — "Train Your Ear" — Four Pillars
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-500/50 mb-4">
              Beyond Video
            </p>
            <h2 className="font-display font-700 text-3xl sm:text-4xl md:text-5xl text-white leading-[1.1]">
              Train Your Ear
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Music Theory */}
            <Link href="/theory" className="group block">
              <div
                className="rounded-2xl border border-amber-800/25 p-6 hover:border-amber-700/40 transition-all duration-300 h-full"
                style={{ background: "linear-gradient(135deg, rgba(180,83,9,0.06) 0%, rgba(120,53,15,0.03) 100%)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-display font-700 text-lg text-white mb-2">Music Theory</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  963 questions across Western classical, jazz, and contemporary theory. Three difficulty levels.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-amber-500/60 group-hover:text-amber-400 transition-colors text-xs font-medium">
                  Start quiz
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Indian Classical */}
            <Link href="/theory?era=75" className="group block">
              <div
                className="rounded-2xl border border-orange-800/25 p-6 hover:border-orange-700/40 transition-all duration-300 h-full"
                style={{ background: "linear-gradient(135deg, rgba(234,88,12,0.06) 0%, rgba(194,65,12,0.03) 100%)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                  </svg>
                </div>
                <h3 className="font-display font-700 text-lg text-white mb-2">Indian Classical</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  250 questions on Carnatic ragas, tala, compositions, and Hindustani traditions.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-orange-500/60 group-hover:text-orange-400 transition-colors text-xs font-medium">
                  Start quiz
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Ear Training */}
            <Link href="/ear-training" className="group block">
              <div
                className="rounded-2xl border border-violet-800/25 p-6 hover:border-violet-700/40 transition-all duration-300 h-full"
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(76,29,149,0.03) 100%)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                </div>
                <h3 className="font-display font-700 text-lg text-white mb-2">Ear Training</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Interactive exercises with Salamander Grand Piano. Intervals, chords, scales, rhythm, progressions.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-violet-500/60 group-hover:text-violet-400 transition-colors text-xs font-medium">
                  Train your ear
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Staff Notation */}
            <Link href="/notation" className="group block">
              <div
                className="rounded-2xl border border-cyan-800/25 p-6 hover:border-cyan-700/40 transition-all duration-300 h-full"
                style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(14,116,144,0.03) 100%)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                </div>
                <h3 className="font-display font-700 text-lg text-white mb-2">Staff Notation</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Read notes, chords, key signatures, and scales directly from professional notation.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-cyan-500/60 group-hover:text-cyan-400 transition-colors text-xs font-medium">
                  Try it
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — "What Makes This Different" — Horizontal scroll
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-500/50 mb-4">Why this exists</p>
          <h2 className="font-display font-700 text-3xl sm:text-4xl text-white leading-[1.15]">
            What Makes This Different
          </h2>
        </div>

        <div className="flex gap-5 px-6 lg:px-8 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {[
            {
              num: "01",
              title: "Real Videos, Real Teaching",
              desc: "Not MIDI demos. Not synth patches. Every question links to a full lesson on YouTube. Jason Zac teaching live, on camera, on the instrument.",
              accent: "#8b5cf6",
              bg: "from-violet-500/8 to-transparent",
            },
            {
              num: "02",
              title: "Global Music Theory",
              desc: "From Western classical harmony to Carnatic ragas and Hindustani traditions. One platform covering the world's musical systems.",
              accent: "#f59e0b",
              bg: "from-amber-500/8 to-transparent",
            },
            {
              num: "03",
              title: "Free Forever",
              desc: "No sign-up, no paywall, no ads. Built by musicians for musicians. Support on Patreon if you want to — but every question is free.",
              accent: "#06B6D4",
              bg: "from-cyan-500/8 to-transparent",
            },
          ].map((step) => (
            <div
              key={step.num}
              className={`flex-shrink-0 w-[320px] sm:w-[380px] p-7 sm:p-8 rounded-2xl bg-gradient-to-b ${step.bg} border border-white/[0.05]`}
            >
              <div
                className="text-5xl sm:text-6xl font-display font-700 mb-6 leading-none"
                style={{ color: step.accent + "25" }}
              >
                {step.num}
              </div>
              <h3 className="font-display font-700 text-lg text-white mb-3">{step.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
          {/* Spacer for scroll end */}
          <div className="flex-shrink-0 w-6 lg:w-8" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — Social / Challenge / YouTube / Patreon
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Challenge card */}
            <div
              className="relative rounded-2xl overflow-hidden border border-white/[0.06] p-8 sm:p-10 flex flex-col justify-between min-h-[280px]"
              style={{ background: "linear-gradient(135deg, rgba(180,83,9,0.08) 0%, rgba(120,53,15,0.04) 100%)" }}
            >
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-violet-400/50 mb-4">Challenge a friend</p>
                <h3 className="font-display font-700 text-2xl sm:text-3xl text-white leading-[1.15] mb-3">
                  Know someone who thinks they<br className="hidden sm:block" />
                  know their theory?
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-sm">
                  Send them a quiz and see how they handle secondary dominants, jazz extensions, and odd time signatures.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-8">
                <a
                  href="https://wa.me/?text=Free+advanced+ear+training+quiz+from+Nathaniel+School+of+Music+https://quiz.nathanielschool.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="https://twitter.com/intent/tweet?text=Just+found+this+free+advanced+ear+training+quiz.+Built+from+real+music+lessons&url=https://quiz.nathanielschool.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60 text-sm font-medium hover:bg-white/[0.08] hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </a>
              </div>
            </div>

            {/* Stacked cards: YouTube + Patreon + Instagram */}
            <div className="flex flex-col gap-6">
              <a
                href={LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/[0.04] hover:border-red-500/15 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-700 text-base text-white mb-1">Free YouTube Lessons</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Every quiz question links back to a full lesson. Get one wrong? The explanation is one click away.
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/15 shrink-0 group-hover:text-red-400/50 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href={LINKS.patreon}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-orange-500/[0.04] hover:border-orange-500/15 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-700 text-base text-white mb-1">Support on Patreon</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    New quiz sets weekly. Early access, exclusive deep-dives, and keeping free music education alive.
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/15 shrink-0 group-hover:text-orange-400/50 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href={LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-pink-500/[0.04] hover:border-pink-500/15 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-pink-500/10 border border-pink-500/15 flex items-center justify-center shrink-0 group-hover:bg-pink-500/20 transition-colors">
                  <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-700 text-base text-white mb-1">Follow on Instagram</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Behind the scenes, quick tips, and new quiz announcements.
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/15 shrink-0 group-hover:text-pink-400/50 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
