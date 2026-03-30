import { ImageResponse } from "next/og";

export const alt = "Nathaniel School of Music — Ear Training Quiz";
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

        {/* Equalizer icon */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 40 }}>
          {[
            { h: 30, o: 0.5 },
            { h: 50, o: 0.7 },
            { h: 70, o: 0.9 },
            { h: 55, o: 0.7 },
            { h: 35, o: 0.5 },
          ].map((bar, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: bar.h,
                borderRadius: 7,
                backgroundColor: `rgba(217,119,6,${bar.o})`,
              }}
            />
          ))}
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
          <span>Ear Training Quiz</span>
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
