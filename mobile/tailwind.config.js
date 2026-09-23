/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // MATCHING YOUR WEB CSS VARIABLES
        background: '#FFFFFF',      // oklch(1 0 0)
        foreground: '#020617',      // oklch(0.145 0 0)
        
        primary: {
          DEFAULT: '#0F172A',       // oklch(0.205 0 0)
          foreground: '#F8FAFC',    // oklch(0.985 0 0)
        },
        
        secondary: {
          DEFAULT: '#F1F5F9',       // oklch(0.97 0 0)
          foreground: '#0F172A',
        },

        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',    // oklch(0.556 0 0)
        },

        accent: {
          DEFAULT: '#F1F5F9',
          foreground: '#0F172A',
        },

        destructive: {
          DEFAULT: '#7F1D1D',       // oklch(0.577 0.245 27.325)
          foreground: '#F8FAFC',
        },

        border: '#E2E8F0',          // oklch(0.922 0 0)
        input: '#E2E8F0',
        ring: '#94A3B8',            // oklch(0.708 0 0)
      },
      borderRadius: {
        lg: '0.5rem',               // From your --radius
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [],
};