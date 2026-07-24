import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF8",
        ink: "#1F2933",
        teal: "#0E7C7B",
        recovered: "#1F9D55",
        canceled: "#E5484D",
        amber: "#D97706"
      },
      boxShadow: {
        panel: "0 12px 36px rgba(31,41,51,0.08)"
      }
    }
  },
  plugins: []
};
export default config;
