import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const alt = "FitStreak profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

interface Params {
  username: string;
}

/**
 * Dynamic OG card for /u/[username] — generates on the fly when a
 * link is shared on Telegram/X/Slack/etc. Falls back to a generic
 * "FitStreak athlete" card if the user doesn't exist.
 */
export default async function PublicProfileOG({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      name: true,
      username: true,
      level: true,
      currentStreak: true,
      bestStreak: true,
      totalEnergy: true,
    },
  });

  const display = user?.name ?? user?.username ?? "Athlete";
  const handle = user?.username ?? "athlete";
  const streak = user?.currentStreak ?? 0;
  const best = user?.bestStreak ?? 0;
  const level = user?.level ?? 1;
  const energy = user?.totalEnergy ?? 0;

  const formatNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#0A0A0B",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(198,255,61,0.22), transparent 55%), radial-gradient(circle at 82% 78%, rgba(127,90,240,0.22), transparent 50%)",
          color: "#F5F5F4",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #c6ff3d 0%, #8aff00 60%, #5fbd00 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A0A0B",
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            F
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>
            FitStreak
          </div>
        </div>

        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 1040,
            }}
          >
            <span style={{ display: "flex" }}>{display}</span>
            <span
              style={{
                display: "flex",
                color: "#A8A29E",
                fontSize: 30,
                fontWeight: 500,
                marginTop: 8,
              }}
            >
              @{handle}
            </span>
          </div>

          {/* Stats chips */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Chip
              tint="#c6ff3d"
              label="streak"
              value={`${streak} d`}
              big
            />
            <Chip tint="#7C5CFF" label="level" value={`${level}`} />
            <Chip tint="#FF8A4C" label="best" value={`${best} d`} />
            <Chip
              tint="#3DE0FF"
              label="energy"
              value={formatNum(energy)}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#A8A29E",
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", gap: 18 }}>
            <span>fitstreak.ru/u/{handle}</span>
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
            Daily streak · Energy · XP
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Chip({
  tint,
  label,
  value,
  big,
}: {
  tint: string;
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "18px 26px",
        borderRadius: 22,
        border: `1px solid ${tint}55`,
        background: `${tint}14`,
        minWidth: big ? 220 : 160,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 18,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: "#A8A29E",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: big ? 64 : 44,
          fontWeight: 800,
          color: tint,
          letterSpacing: -1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
