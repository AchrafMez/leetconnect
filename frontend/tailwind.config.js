const config = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                "background-elevated": "var(--background-elevated)",
                foreground: "var(--foreground)",
                "foreground-muted": "var(--foreground-muted)",
                accent: {
                    DEFAULT: "rgb(var(--accent-primary))",
                    hover: "rgb(var(--accent-hover))",
                    muted: "rgba(var(--accent-muted), 0.15)",
                },
                border: "var(--border)",
                "border-hover": "var(--border-hover)",
                card: "var(--card)",
                input: "var(--input)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                logo: ["Poppins", "sans-serif"],
            },
            keyframes: {
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                marquee: {
                    "0%":   { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
            animation: {
                "fade-up": "fade-up 0.5s ease-out forwards",
                marquee:   "marquee 40s linear infinite",
            },
        },
    },
    plugins: [],
};
export default config;
//# sourceMappingURL=tailwind.config.js.map