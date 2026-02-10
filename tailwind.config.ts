import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"] ,
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#866087",
          teal: "#66C3B1",
          gold: "#FCD34D",
          night: "#0f172a",
          light: "#f8fafc",
          emerald: "#0B2B2B",
          deep: "#071B1B",
          sand: "#E3C17A",
          ink: "#0B1114"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"]
      },
      backgroundImage: {
        "moon-gradient": "radial-gradient(circle at 30% 20%, rgba(134,96,135,0.35), transparent 55%), radial-gradient(circle at 70% 10%, rgba(102,195,177,0.35), transparent 50%), linear-gradient(135deg, #0f172a, #1e293b)",
        "ramadan-panel": "linear-gradient(145deg, rgba(11,43,43,0.95), rgba(7,27,27,0.98))",
        "ornament": "radial-gradient(circle at 20% 15%, rgba(227,193,122,0.18), transparent 40%), radial-gradient(circle at 80% 10%, rgba(252,211,77,0.12), transparent 45%)"
      }
    }
  },
  plugins: []
} satisfies Config;
