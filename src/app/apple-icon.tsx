import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 110,
          background:
            "linear-gradient(135deg, #c6ff3d 0%, #8aff00 60%, #5fbd00 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0A0A0B",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          letterSpacing: -4,
        }}
      >
        F
      </div>
    ),
    { ...size },
  );
}
