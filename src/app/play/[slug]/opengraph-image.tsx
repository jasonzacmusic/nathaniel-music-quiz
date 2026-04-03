import { ImageResponse } from "next/og";
import { getSetById, getQuestionPreviews } from "@/lib/queries";

export const alt = "Nathaniel School of Music Quiz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_ACCENTS: Record<string, string> = {
  piano: "#f59e0b",
  bass: "#8b5cf6",
  whistle: "#06b6d4",
};

export default async function OGImage({ params }: { params: { slug: string } }) {
  const set = await getSetById(params.slug);
  const previews = set ? await getQuestionPreviews(params.slug) : [];
  const accent = CATEGORY_ACCENTS[(set?.category || "").toLowerCase()] || "#f59e0b";
  const title = set?.category || "Music Quiz";
  const questionCount = set?.num_questions || previews.length;
  const sampleQuestions = previews.slice(0, 3).map(p => p.question_text);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a0a08 0%, #1c1917 40%, #1a1510 100%)",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -100,
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${accent}33 0%, transparent 70%)`,
          }}
        />

        {/* Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 50,
              background: `${accent}22`,
              border: `1px solid ${accent}44`,
              fontSize: 18,
              fontWeight: 600,
              color: accent,
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 16, color: "rgba(168,162,158,0.5)" }}>
            Set {params.slug.split("-").pop()}
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          Ear Training Quiz
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 22,
            color: "rgba(168,162,158,0.6)",
            marginBottom: 40,
          }}
        >
          <span>{questionCount} questions</span>
          <span style={{ color: `${accent}66` }}>|</span>
          <span>Video-based</span>
          <span style={{ color: `${accent}66` }}>|</span>
          <span>~{Math.max(2, Math.ceil(questionCount * 0.8))} min</span>
        </div>

        {/* Sample questions */}
        {sampleQuestions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sampleQuestions.map((q, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 17,
                  color: "rgba(168,162,158,0.45)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: `${accent}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: accent,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <span>{q.length > 60 ? q.slice(0, 57) + "..." : q}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 80,
            right: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#0a0a08",
                border: `1px solid ${accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: accent,
              }}
            >
              N
            </div>
            <span style={{ fontSize: 16, color: "rgba(168,162,158,0.4)" }}>
              Nathaniel School of Music
            </span>
          </div>
          <span style={{ fontSize: 16, color: "rgba(168,162,158,0.3)" }}>
            quiz.nathanielschool.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
