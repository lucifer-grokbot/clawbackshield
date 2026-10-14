import type { Config } from "tailwindcss";
// Brand: "Ledger & Hearth" — Stripe-like clarity, warm editorial paper tones
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      navy: { DEFAULT: "#13213C", 700: "#22345A", 50: "#EAEEF5" }, // ink
      cream: "#FAF6EE", paper: "#F3ECDD",
      rust: { DEFAULT: "#A6461F", 100: "#F6E2D6" },                 // terracotta, 5.6:1 on cream
      amber: { DEFAULT: "#D99A2B", 100: "#FBEFD9" },
      sage: { DEFAULT: "#2F5E4B", 100: "#DDEAE2" },
    },
    fontFamily: { serif: ["var(--font-serif)", "Georgia", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    fontSize: { base: ["1.125rem", "1.7"] },
  } },
  plugins: [],
};
export default config;
