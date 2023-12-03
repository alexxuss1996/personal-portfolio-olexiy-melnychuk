/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        "white-smoke": "#F5F5F5",
        bittersweet: "#ED7161",
        black: "#000000",
        dark: "#13070C",
        platinum: "D9D9D9",
        linen: "#F7ECE5",
        indigo: "#8E7DBE",
        orange: "#FC8936",
        blue: "#AFBFD5",
      },
      fontSize: {
        "3xl": "5rem",
        "2xl": "2.5rem",
        xl: "2rem",
        lg: "1.5rem",
        md: "1.25rem",
        base: "1rem",
        sm: "0.875rem",
      },
      lineHeight: {
        heading: "1.325",
        relaxed: "1.625",
      },
      borderRadius: {
        main: "0.25rem", // 4px
      },
      screens: {
        xl: "1440px",
        lg: "1280px",
        md: "768px",
        sm: "480px",
      },
      container: {
        center: true,
        padding: {
          xl: 0, // 60px
          lg: "2rem",
          md: "2rem",
          sm: "1rem",
        },
      },
      transitionDuration: {
        DEFAULT: "350ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      maxWidth: {
        desktop: "1440px",
        tablet: "1280px",
        mobile: "768px",
      },
    },
  },
  plugins: [],
};
