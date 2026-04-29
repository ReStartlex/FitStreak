import { ImageResponse } from "next/og";

export const alt = "FitStreak — Streak. Show up. Every day.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#0A0A0B",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(198,255,61,0.18), transparent 60%), radial-gradient(circle at 80% 80%, rgba(127,90,240,0.18), transparent 50%)",
          color: "#F5F5F4",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background:
                "linear-gradient(135deg, #c6ff3d 0%, #8aff00 60%, #5fbd00 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A0A0B",
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            F
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
            FitStreak
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 86,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -3,
              maxWidth: 980,
            }}
          >
            <span style={{ display: "flex" }}>Streak. Show up.</span>
            <span style={{ display: "flex", color: "#c6ff3d" }}>
              Every day.
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#A8A29E",
              maxWidth: 820,
            }}
          >
            Социальная платформа ежедневной активности — серия дней, челленджи и
            рейтинги.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#A8A29E",
            fontSize: 20,
          }}
        >
          <div style={{ display: "flex", gap: 28 }}>
            <span>fitstreak.ru</span>
            <span>·</span>
            <span>Energy · XP · 100 levels</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid rgba(198,255,61,0.4)",
              color: "#c6ff3d",
              fontWeight: 600,
            }}
          >
            Daily streak
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
