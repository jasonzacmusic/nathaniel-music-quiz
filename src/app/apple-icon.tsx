import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #7C3AED, #5b21b6, #06B6D4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          {[
            { h: 40, o: 0.6 },
            { h: 65, o: 0.8 },
            { h: 90, o: 1 },
            { h: 70, o: 0.8 },
            { h: 45, o: 0.6 },
          ].map((bar, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: bar.h,
                borderRadius: 9,
                backgroundColor: `rgba(255,255,255,${bar.o})`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
