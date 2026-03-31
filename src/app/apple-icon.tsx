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
          background: "#0a0a08",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "#f59e0b",
            lineHeight: 1,
          }}
        >
          N
        </div>
      </div>
    ),
    { ...size }
  );
}
