/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
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
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Deep Ocean theme colors
        ocean: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0a1929', // Navy base
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2', // Accent cyan
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Deep Ocean specific radius values
        '10': '10px',
        '14': '14px',
        '20': '20px',
        '28': '28px',
        '32': '32px',
        '40': '40px',
      },
      fontSize: {
        // Deep Ocean Typography Scale (Apple-inspired)
        '13': ['13px', { lineHeight: '1.5' }],
        '14': ['14px', { lineHeight: '1.5' }],
        '15': ['15px', { lineHeight: '1.5' }],
        '17': ['17px', { lineHeight: '1.5' }],
        '19': ['19px', { lineHeight: '1.4' }],
        '21': ['21px', { lineHeight: '1.4' }],
        '24': ['24px', { lineHeight: '1.3' }],
        '52': ['52px', { lineHeight: '1.1' }],
        '56': ['56px', { lineHeight: '1.1' }],
        '64': ['64px', { lineHeight: '1.1' }],
        '72': ['72px', { lineHeight: '1' }],
        '84': ['84px', { lineHeight: '1' }],
      },
      boxShadow: {
        // Deep Ocean shadows
        'ocean-sm': '0 2px 8px -2px rgba(37, 99, 235, 0.1)',
        'ocean': '0 10px 40px -10px rgba(37, 99, 235, 0.2)',
        'ocean-md': '0 12px 48px -8px rgba(37, 99, 235, 0.25)',
        'ocean-lg': '0 20px 60px -10px rgba(37, 99, 235, 0.3)',
        'ocean-xl': '0 25px 70px -12px rgba(37, 99, 235, 0.4)',
        'cyan-sm': '0 2px 8px -2px rgba(8, 145, 178, 0.1)',
        'cyan-md': '0 12px 48px -8px rgba(8, 145, 178, 0.2)',
        'cyan-lg': '0 20px 60px -10px rgba(8, 145, 178, 0.25)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in-up": {
          from: { 
            opacity: 0, 
            transform: "translateY(30px)" 
          },
          to: { 
            opacity: 1, 
            transform: "translateY(0)" 
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "ocean-wave": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 2s infinite linear",
        "ocean-wave": "ocean-wave 3s ease-in-out infinite",
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        'ocean': '12px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}