import { Award, Crown, Flame, Medal, Shield, Sparkles, type LucideIcon } from "lucide-react";

export type RankTier = "bronze" | "silver" | "gold" | "elite" | "legend";

export interface RankDivision {
  tier: RankTier;
  /** Optional roman division (I = top within tier, III = entry). */
  division?: "I" | "II" | "III";
  nameRu: string;
  nameEn: string;
  range: [number, number];
}

export interface TierTheme {
  tier: RankTier;
  icon: LucideIcon;
  /** Tailwind text color class for icon. */
  textClass: string;
  /** Tailwind border color class for badge. */
  borderClass: string;
  /** Tailwind background gradient class. */
  gradientClass: string;
  /** Tailwind ring/glow class. */
  ringClass: string;
  /** Color hex for inline styles (e.g. SVG accents). */
  hex: string;
}

export const TIER_THEMES: Record<RankTier, TierTheme> = {
  bronze: {
    tier: "bronze",
    icon: Shield,
    textClass: "text-[#d6985f]",
    borderClass: "border-[#d6985f]/40",
    gradientClass: "from-[#7a4a23] via-[#d6985f] to-[#3b2110]",
    ringClass: "shadow-[0_0_0_1px_rgba(214,152,95,0.35),0_10px_40px_-10px_rgba(214,152,95,0.45)]",
    hex: "#d6985f",
  },
  silver: {
    tier: "silver",
    icon: Medal,
    textClass: "text-[#c9d3df]",
    borderClass: "border-[#c9d3df]/40",
    gradientClass: "from-[#7d8696] via-[#dde4ec] to-[#3a4250]",
    ringClass: "shadow-[0_0_0_1px_rgba(201,211,223,0.35),0_10px_40px_-10px_rgba(201,211,223,0.5)]",
    hex: "#c9d3df",
  },
  gold: {
    tier: "gold",
    icon: Award,
    textClass: "text-[#ffcc4d]",
    borderClass: "border-[#ffcc4d]/45",
    gradientClass: "from-[#a06a16] via-[#ffd866] to-[#3d2503]",
    ringClass: "shadow-[0_0_0_1px_rgba(255,204,77,0.35),0_14px_50px_-12px_rgba(255,204,77,0.55)]",
    hex: "#ffcc4d",
  },
  elite: {
    tier: "elite",
    icon: Sparkles,
    textClass: "text-[#b388ff]",
    borderClass: "border-[#b388ff]/45",
    gradientClass: "from-[#3b1d8a] via-[#b388ff] to-[#1a0a45]",
    ringClass: "shadow-[0_0_0_1px_rgba(179,136,255,0.4),0_14px_60px_-12px_rgba(179,136,255,0.6)]",
    hex: "#b388ff",
  },
  legend: {
    tier: "legend",
    icon: Crown,
    textClass: "text-lime-300",
    borderClass: "border-lime-300/50",
    gradientClass: "from-[#1a2906] via-[#c6ff3d] to-[#0d1303]",
    ringClass: "shadow-[0_0_0_1px_rgba(198,255,61,0.5),0_18px_70px_-12px_rgba(198,255,61,0.7)]",
    hex: "#c6ff3d",
  },
};

export const DIVISIONS: RankDivision[] = [
  { tier: "bronze", division: "III", nameRu: "Бронза III", nameEn: "Bronze III", range: [1, 5] },
  { tier: "bronze", division: "II", nameRu: "Бронза II", nameEn: "Bronze II", range: [6, 10] },
  { tier: "bronze", division: "I", nameRu: "Бронза I", nameEn: "Bronze I", range: [11, 15] },
  { tier: "silver", division: "III", nameRu: "Серебро III", nameEn: "Silver III", range: [16, 22] },
  { tier: "silver", division: "II", nameRu: "Серебро II", nameEn: "Silver II", range: [23, 29] },
  { tier: "silver", division: "I", nameRu: "Серебро I", nameEn: "Silver I", range: [30, 35] },
  { tier: "gold", division: "III", nameRu: "Золото III", nameEn: "Gold III", range: [36, 43] },
  { tier: "gold", division: "II", nameRu: "Золото II", nameEn: "Gold II", range: [44, 51] },
  { tier: "gold", division: "I", nameRu: "Золото I", nameEn: "Gold I", range: [52, 60] },
  { tier: "elite", division: "III", nameRu: "Элита III", nameEn: "Elite III", range: [61, 69] },
  { tier: "elite", division: "II", nameRu: "Элита II", nameEn: "Elite II", range: [70, 77] },
  { tier: "elite", division: "I", nameRu: "Элита I", nameEn: "Elite I", range: [78, 85] },
  { tier: "legend", nameRu: "Легенда", nameEn: "Legend", range: [86, 100] },
];

export function getDivision(level: number): RankDivision {
  return (
    DIVISIONS.find((d) => level >= d.range[0] && level <= d.range[1]) ??
    DIVISIONS[0]
  );
}

export function getTierTheme(tier: RankTier) {
  return TIER_THEMES[tier];
}

export function getTierForLevel(level: number) {
  return getDivision(level).tier;
}

/** Range for a tier (lowest..highest level). */
export function getTierRange(tier: RankTier): [number, number] {
  const list = DIVISIONS.filter((d) => d.tier === tier);
  return [list[0].range[0], list[list.length - 1].range[1]];
}

export function nextDivision(level: number): RankDivision | null {
  const idx = DIVISIONS.findIndex((d) => level >= d.range[0] && level <= d.range[1]);
  if (idx === -1) return null;
  return DIVISIONS[idx + 1] ?? null;
}

export function divisionName(d: RankDivision, locale: "ru" | "en") {
  return locale === "ru" ? d.nameRu : d.nameEn;
}

export function tierName(tier: RankTier, locale: "ru" | "en") {
  const map = {
    bronze: { ru: "Бронза", en: "Bronze" },
    silver: { ru: "Серебро", en: "Silver" },
    gold: { ru: "Золото", en: "Gold" },
    elite: { ru: "Элита", en: "Elite" },
    legend: { ru: "Легенда", en: "Legend" },
  } as const;
  return map[tier][locale];
}
