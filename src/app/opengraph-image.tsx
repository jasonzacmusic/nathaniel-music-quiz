import { ImageResponse } from "next/og";

export const alt = "Nathaniel School of Music — Music Quiz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(145deg, #0a0a08 0%, #1c1917 40%, #1a1510 100%)",
          position: "relative",
        }}
      >
        {/* Warm glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(180,83,9,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "#0a0a08",
            border: "2px solid rgba(245,158,11,0.3)",
            marginBottom: 40,
            fontSize: 52,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "#f59e0b",
          }}
        >
          N
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#fcd34d",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Nathaniel School of Music
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(214,211,209,0.6)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Advanced ear training from real teaching videos
        </div>

        {/* Bottom line */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            fontSize: 18,
            color: "rgba(214,211,209,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <span>Music Quiz</span>
          <span style={{ color: "rgba(180,83,9,0.5)" }}>|</span>
          <span>330+ Questions</span>
          <span style={{ color: "rgba(180,83,9,0.5)" }}>|</span>
          <span>Free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
