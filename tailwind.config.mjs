/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                syntix: {
                    primary: "#FF6B00",
                    background: "#0A0A0A",
                    surface: "#1A1A1A",
                    textPrimary: "#FFFFFF",
                    textSecondary: "#A8A29E",
                    accent: "#FF6B00",
                }
            },
            fontFamily: {
                sans: ['Inter', 'Geist', 'sans-serif'],
                mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
};
