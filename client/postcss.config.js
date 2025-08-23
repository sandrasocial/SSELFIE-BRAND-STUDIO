export default {
  plugins: {
    tailwindcss: {
      config: {
        content: [
          "./index.html", 
          "./src/**/*.{js,jsx,ts,tsx}",
          "../shared/**/*.{js,jsx,ts,tsx}"
        ],
        darkMode: ["class"],
        theme: {
          extend: {
            fontFamily: {
              'times': ['Times New Roman', 'Times', 'serif'],
              'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            colors: {
              background: "var(--background)",
              foreground: "var(--foreground)",
              card: {
                DEFAULT: "var(--card)",
                foreground: "var(--card-foreground)",
              },
              primary: {
                DEFAULT: "var(--primary)",
                foreground: "var(--primary-foreground)",
              },
              secondary: {
                DEFAULT: "var(--secondary)",
                foreground: "var(--secondary-foreground)",
              },
              muted: {
                DEFAULT: "var(--muted)",
                foreground: "var(--muted-foreground)",
              },
              accent: {
                DEFAULT: "var(--accent)",
                foreground: "var(--accent-foreground)",
              },
              destructive: {
                DEFAULT: "var(--destructive)",
                foreground: "var(--destructive-foreground)",
              },
              border: "var(--border)",
              input: "var(--input)",
              ring: "var(--ring)",
            },
          },
        },
        plugins: [],
      }
    },
    autoprefixer: {},
  },
}