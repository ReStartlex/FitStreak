import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // brand palette — neon sports-tech
        bg: {
          DEFAULT: "#0A0A0B",
          soft: "#101013",
          card: "#13131A",
          elevated: "#191922",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        ink: {
          DEFAULT: "#F5F6F7",
          dim: "#A2A4B0",
          muted: "#6B6E7B",
        },
        lime: {
          DEFAULT: "#C6FF3D",
          soft: "#D8FF7A",
          deep: "#9CDB1C",
        },
        violet: {
          DEFAULT: "#7C5CFF",
          soft: "#A38BFF",
          deep: "#5B3CE6",
        },
        accent: {
          orange: "#FF8A4C",
          rose: "#FF5C8A",
          cyan: "#3DE0FF",
        },
        success: "#3DD68C",
        danger: "#FF5C5C",
        warning: "#FFB13D",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 7vw + 1rem, 6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw + 0.5rem, 4.25rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(198,255,61,0.3), 0 10px 60px -10px rgba(198,255,61,0.45)",
        violet: "0 0 0 1px rgba(124,92,255,0.35), 0 10px 60px -10px rgba(124,92,255,0.55)",
        soft: "0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.6)",
        ring: "0 0 0 1px rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, transparent, #0A0A0B 80%), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 80px)",
        "radial-lime":
          "radial-gradient(800px 400px at 50% -10%, rgba(198,255,61,0.18), transparent 70%)",
        "radial-violet":
          "radial-gradient(600px 400px at 80% 0%, rgba(124,92,255,0.22), transparent 70%)",
        "lime-gradient":
          "linear-gradient(135deg, #C6FF3D 0%, #9CDB1C 100%)",
        "violet-gradient":
          "linear-gradient(135deg, #A38BFF 0%, #5B3CE6 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        flame: {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.06) rotate(2deg)", filter: "brightness(1.15)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
        flame: "flame 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
