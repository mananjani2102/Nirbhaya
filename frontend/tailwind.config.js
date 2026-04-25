/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: "var(--card)",
        ring: "var(--ring)",
        input: "var(--input)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        border: "var(--border)",
        popover: "var(--popover)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        destructive: "var(--destructive)",

        "card-foreground": "var(--card-foreground)",
        "muted-foreground": "var(--muted-foreground)",
        "accent-foreground": "var(--accent-foreground)",
        "popover-foreground": "var(--popover-foreground)",
        "primary-foreground": "var(--primary-foreground)",
        "secondary-foreground": "var(--secondary-foreground)",
        "destructive-foreground": "var(--destructive-foreground)",

        sidebar: "var(--sidebar)",
        "sidebar-ring": "var(--sidebar-ring)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",

        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },

      borderRadius: {
        DEFAULT: "var(--radius)",
      },

      fontFamily: {
        sans: ["Merriweather", "serif"],
        mono: ["JetBrains Mono", "monospace"],
        serif: ["Source Serif 4", "serif"],
        headline: ["Merriweather", "serif"],
        body: ["Source Serif 4", "serif"],
        label: ["Manrope", "sans-serif"],
      },

      boxShadow: {
        custom: `
          var(--shadow-offset-x)
          var(--shadow-offset-y)
          var(--shadow-blur)
          var(--shadow-spread)
          var(--shadow-color)
        `,
      },
    },
  },
  plugins: [],
};