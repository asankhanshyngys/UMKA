/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9F7F2",
        card: "#FFFFFF",
        border: "#E8E4DC",
        accent: {
          DEFAULT: "#1B3C35",
          dark: "#142E28",
          light: "#2A5249",
        },
        thumbnail: {
          mustard: "#C4A035",
          sage: "#8FA88E",
          forest: "#1B3C35",
        },
        foreground: {
          DEFAULT: "#1A1A1A",
          muted: "#6B6560",
          subtle: "#9C9690",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      letterSpacing: {
        label: "0.12em",
      },
    },
  },
  plugins: [],
};
