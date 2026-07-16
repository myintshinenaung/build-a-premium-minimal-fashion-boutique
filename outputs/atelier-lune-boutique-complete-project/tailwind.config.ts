import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        mist: "#F5F5F5",
        line: "#E7E2DC",
        clay: "#B8A896",
        stone: "#77716A"
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "Segoe UI", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 45px rgba(17, 17, 17, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
