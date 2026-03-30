import { ImageResponse } from "next/og";

export const alt = "Sonic Studio by Nathaniel School of Music";
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
          background: "linear-gradient(145deg, #080D1A 0%, #0F172A 40%, #162032 100%)",
          position: "relative",
        }}
      >
        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: 100,
            width: 500,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(6,182,212,0.15) 0%, transparent 70%)",
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
                backgroundColor: `rgba(255,255,255,${bar.o})`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Sonic Studio
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
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
            color: "rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <span>Nathaniel School of Music</span>
          <span style={{ color: "rgba(124,58,237,0.6)" }}>|</span>
          <span>330+ Questions</span>
          <span style={{ color: "rgba(124,58,237,0.6)" }}>|</span>
          <span>Free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
