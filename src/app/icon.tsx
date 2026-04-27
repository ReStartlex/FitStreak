import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
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
          borderRadius: 36,
        }}
      >
        F
      </div>
    ),
    { ...size },
  );
}
