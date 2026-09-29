/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")], // REQUIRED for NativeWind v4
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#020617',
        
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#F8FAFC',
        },
        
        secondary: {
          DEFAULT: '#F1F5F9',
          foreground: '#0F172A',
        },

        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },

        accent: {
          DEFAULT: '#F1F5F9',
          foreground: '#0F172A',
        },

        destructive: {
          DEFAULT: '#7F1D1D',
          foreground: '#F8FAFC',
        },

        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#94A3B8',
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
    },
  },
  plugins: [],
};