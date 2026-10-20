import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 科目別アクセントカラー
        kokugo: {
          DEFAULT: "#e07b54",
          light: "#f5d0c0",
          dark: "#c05a30",
        },
        suugaku: {
          DEFAULT: "#4a90d9",
          light: "#c0daf5",
          dark: "#2a6aaa",
        },
        eigo: {
          DEFAULT: "#5ba85b",
          light: "#c0e8c0",
          dark: "#3a7a3a",
        },
        rika: {
          DEFAULT: "#9b59b6",
          light: "#dfc0ef",
          dark: "#7a3a95",
        },
        shakai: {
          DEFAULT: "#e6a817",
          light: "#f5dfa0",
          dark: "#b07a00",
        },
      },
    },
  },
  plugins: [],
};

export default config;
