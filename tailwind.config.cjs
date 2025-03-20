/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["variant", [".dark &", '[data-kb-theme="dark"] &']],
content: [
		"src/**/*.{ts,tsx}",
		"src/components/**/*.{ts,tsx}",
		"src/features/**/*.{ts,tsx}",
		"src/components/common/**/*.{ts,tsx}",
	],
  prefix: "",
safelist: [
		"bg-red-200",
		"bg-red-300",
		"bg-red-400",
		"bg-red-500",
		"bg-blue-200",
		"bg-blue-300",
		"bg-blue-400",
		"bg-blue-500",
		"bg-green-200",
		"bg-green-300",
		"bg-green-400",
		"bg-green-500",
		"bg-yellow-200",
		"bg-yellow-300",
		"bg-yellow-400",
		"bg-yellow-500",
		"bg-purple-200",
		"bg-purple-300",
		"bg-purple-400",
		"bg-purple-500",
		"bg-pink-200",
		"bg-pink-300",
		"bg-pink-400",
		"bg-pink-500",
		"bg-indigo-200",
		"bg-indigo-300",
		"bg-indigo-400",
		"bg-indigo-500",
		"bg-red-200/10",
		"bg-red-300/10",
		"bg-red-400/10",
		"bg-red-500/10",
		"bg-blue-200/10",
		"bg-blue-300/10",
		"bg-blue-400/10",
		"bg-blue-500/10",
		"bg-green-200/10",
		"bg-green-300/10",
		"bg-green-400/10",
		"bg-green-500/10",
		"bg-yellow-200/10",
		"bg-yellow-300/10",
		"bg-yellow-400/10",
		"bg-yellow-500/10",
		"bg-purple-200/10",
		"bg-purple-300/10",
		"bg-purple-400/10",
		"bg-purple-500/10",
		"bg-pink-200/10",
		"bg-pink-300/10",
		"bg-pink-400/10",
		"bg-pink-500/10",
		"bg-indigo-200/10",
		"bg-indigo-300/10",
		"bg-indigo-400/10",
		"bg-indigo-500/10",
		"hover:bg-red-200/50",
		"hover:bg-red-300/50",
		"hover:bg-red-400/50",
		"hover:bg-red-500/50",
		"hover:bg-blue-200/50",
		"hover:bg-blue-300/50",
		"hover:bg-blue-400/50",
		"hover:bg-blue-500/50",
		"hover:bg-green-200/50",
		"hover:bg-green-300/50",
		"hover:bg-green-400/50",
		"hover:bg-green-500/50",
		"hover:bg-yellow-200/50",
		"hover:bg-yellow-300/50",
		"hover:bg-yellow-400/50",
		"hover:bg-yellow-500/50",
		"hover:bg-purple-200/50",
		"hover:bg-purple-300/50",
		"hover:bg-purple-400/50",
		"hover:bg-purple-500/50",
		"hover:bg-pink-200/50",
		"hover:bg-pink-300/50",
		"hover:bg-pink-400/50",
		"hover:bg-pink-500/50",
		"hover:bg-indigo-200/50",
		"hover:bg-indigo-300/50",
		"hover:bg-indigo-400/50",
		"hover:bg-indigo-500/50",
		"border-red-200",
		"border-red-300",
		"border-red-400",
		"border-red-500",
		"border-blue-200",
		"border-blue-300",
		"border-blue-400",
		"border-blue-500",
		"border-green-200",
		"border-green-300",
		"border-green-400",
		"border-green-500",
		"border-yellow-200",
		"border-yellow-300",
		"border-yellow-400",
		"border-yellow-500",
		"border-purple-200",
		"border-purple-300",
		"border-purple-400",
		"border-purple-500",
		"border-pink-200",
		"border-pink-300",
		"border-pink-400",
		"border-pink-500",
		"border-indigo-200",
		"border-indigo-300",
		"border-indigo-400",
		"border-indigo-500",
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))"
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--kb-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--kb-accordion-content-height)" },
          to: { height: 0 }
        },
        "content-show": {
          from: { opacity: 0, transform: "scale(0.96)" },
          to: { opacity: 1, transform: "scale(1)" }
        },
        "content-hide": {
          from: { opacity: 1, transform: "scale(1)" },
          to: { opacity: 0, transform: "scale(0.96)" }
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "content-show": "content-show 0.2s ease-out",
        "content-hide": "content-hide 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
