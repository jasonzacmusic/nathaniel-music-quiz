import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSetById, getQuestionPreviews } from "@/lib/queries";

interface PlayPageProps {
  params: { slug: string };
}

const CATEGORY_COLORS: Record<string, { accent: string; bg: string; border: string; badge: string }> = {
  piano: { accent: "text-amber-400", bg: "rgba(180,83,9,0.12)", border: "border-amber-500/30", badge: "bg-amber-500/15 text-amber-400" },
  bass: { accent: "text-violet-400", bg: "rgba(124,58,237,0.12)", border: "border-violet-500/30", badge: "bg-violet-500/15 text-violet-400" },
  whistle: { accent: "text-cyan-400", bg: "rgba(6,182,212,0.12)", border: "border-cyan-500/30", badge: "bg-cyan-500/15 text-cyan-400" },
};

const CATEGORY_ICONS: Record<string, string> = {
  piano: "🎹", bass: "🎸", whistle: "🎵",
};

function getStyle(category: string) {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.piano;
}

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const set = await getSetById(params.slug);
  if (!set) return { title: "Quiz Not Found" };

  const title = `${set.category} Ear Training Quiz | Nathaniel School`;
  const description = `Test your ear with video-based ${set.category.toLowerCase()} questions. Free interactive quiz from Nathaniel School of Music.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://quiz.nathanielschool.com/play/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PlayPage({ params }: PlayPageProps) {
  const set = await getSetById(params.slug);
  if (!set) notFound();

  const previews = await getQuestionPreviews(params.slug);
  const style = getStyle(set.category);
  const icon = CATEGORY_ICONS[set.category.toLowerCase()] || "🎵";
  const estimatedMinutes = Math.max(2, Math.ceil(set.num_questions * 0.8));

  // Collect unique youtube lesson titles for display
  const lessonTopics = Array.from(new Set(
    previews.map(p => p.youtube_title).filter(Boolean) as string[]
  )).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#0a0a08] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-30" style={{ background: style.bg }} />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10" style={{ background: style.bg }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-5 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors text-sm mb-12">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Home
        </Link>

        {/* Category badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-display font-600 uppercase tracking-wider ${style.badge}`}>
            <span className="text-base">{icon}</span>
            {set.category}
          </span>
          <span className="text-stone-600 text-xs">Set {params.slug.split("-").pop()}</span>
        </div>

        {/* Title */}
        <h1 className="font-display font-700 text-4xl sm:text-5xl leading-[1.1] mb-4">
          <span className={style.accent}>{set.category}</span>
          <span className="text-white"> Ear Training</span>
        </h1>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-stone-400 mb-8">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Video quiz
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-700" />
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ~{estimatedMinutes} min
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-700" />
          <span>Video-based</span>
        </div>

        {/* Question preview cards */}
        <div className="mb-10">
          <p className="text-[11px] text-stone-600 uppercase tracking-[0.2em] font-medium mb-4">What you&apos;ll be asked</p>
          <div className="space-y-2">
            {previews.slice(0, 4).map((q, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${style.border} bg-white/[0.02]`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-display font-700 ${style.badge}`}>
                  {i + 1}
                </span>
                <p className="text-sm text-stone-300 leading-relaxed">{q.question_text}</p>
              </div>
            ))}
            {previews.length > 4 && (
              <p className="text-center text-stone-600 text-xs mt-2">
                + {previews.length - 4} more questions
              </p>
            )}
          </div>
        </div>

        {/* Lesson topics */}
        {lessonTopics.length > 0 && (
          <div className="mb-10">
            <p className="text-[11px] text-stone-600 uppercase tracking-[0.2em] font-medium mb-3">Topics covered</p>
            <div className="flex flex-wrap gap-2">
              {lessonTopics.map((topic) => (
                <span key={topic} className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs text-stone-400">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/quiz/${set.set_id}`}
          className="group block w-full py-5 rounded-2xl font-display font-700 text-xl text-center text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #b45309, #92400e, #78350f)",
            boxShadow: "0 0 40px rgba(180,83,9,0.35), 0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <span className="flex items-center justify-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Start Quiz
          </span>
        </Link>

        <p className="text-center text-stone-600 text-xs mt-4">
          Watch video clips. Listen carefully. Pick the right answer.
        </p>

        {/* Branding footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/nsm-logo.png" alt="NSM" width={20} height={20} className="object-contain opacity-40" />
            <span className="text-[11px] text-stone-600 font-display">Nathaniel School of Music</span>
          </div>
          <Link href="/challenge" className="text-[11px] text-stone-500 hover:text-amber-400 transition-colors font-medium">
            Browse more quizzes
          </Link>
        </div>
      </div>
    </main>
  );
}
