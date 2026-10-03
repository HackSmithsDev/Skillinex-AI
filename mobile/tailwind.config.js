/** @type {import('tailwindcss').Config} */
// Colors resolve to CSS variables declared in global.css (single source of truth).
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: { DEFAULT: 'rgb(var(--card) / <alpha-value>)', foreground: 'rgb(var(--card-foreground) / <alpha-value>)' },
        popover: { DEFAULT: 'rgb(var(--popover) / <alpha-value>)', foreground: 'rgb(var(--popover-foreground) / <alpha-value>)' },
        primary: { DEFAULT: 'rgb(var(--primary) / <alpha-value>)', foreground: 'rgb(var(--primary-foreground) / <alpha-value>)', hover: 'rgb(var(--primary-hover) / <alpha-value>)' },
        secondary: { DEFAULT: 'rgb(var(--secondary) / <alpha-value>)', foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)' },
        muted: { DEFAULT: 'rgb(var(--muted) / <alpha-value>)', foreground: 'rgb(var(--muted-foreground) / <alpha-value>)' },
        accent: { DEFAULT: 'rgb(var(--accent) / <alpha-value>)', foreground: 'rgb(var(--accent-foreground) / <alpha-value>)' },
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
        soft: 'rgb(var(--soft) / <alpha-value>)',
        inverse: 'rgb(var(--inverse) / <alpha-value>)',
        info: { subtle: 'rgb(var(--info-subtle) / <alpha-value>)', soft: 'rgb(var(--info-soft) / <alpha-value>)', DEFAULT: 'rgb(var(--info) / <alpha-value>)', strong: 'rgb(var(--info-strong) / <alpha-value>)' },
        success: { subtle: 'rgb(var(--success-subtle) / <alpha-value>)', soft: 'rgb(var(--success-soft) / <alpha-value>)', DEFAULT: 'rgb(var(--success) / <alpha-value>)', strong: 'rgb(var(--success-strong) / <alpha-value>)' },
        danger: { subtle: 'rgb(var(--danger-subtle) / <alpha-value>)', soft: 'rgb(var(--danger-soft) / <alpha-value>)', DEFAULT: 'rgb(var(--danger) / <alpha-value>)', strong: 'rgb(var(--danger-strong) / <alpha-value>)' },
        highlight: { subtle: 'rgb(var(--highlight-subtle) / <alpha-value>)', soft: 'rgb(var(--highlight-soft) / <alpha-value>)', DEFAULT: 'rgb(var(--highlight) / <alpha-value>)', strong: 'rgb(var(--highlight-strong) / <alpha-value>)' },
        warning: { subtle: 'rgb(var(--warning-subtle) / <alpha-value>)', soft: 'rgb(var(--warning-soft) / <alpha-value>)', DEFAULT: 'rgb(var(--warning) / <alpha-value>)', strong: 'rgb(var(--warning-strong) / <alpha-value>)' },
        plum: { subtle: 'rgb(var(--plum-subtle) / <alpha-value>)', soft: 'rgb(var(--plum-soft) / <alpha-value>)', DEFAULT: 'rgb(var(--plum) / <alpha-value>)', strong: 'rgb(var(--plum-strong) / <alpha-value>)' },
        brand: { subtle: 'rgb(var(--brand-subtle) / <alpha-value>)', soft: 'rgb(var(--brand-soft) / <alpha-value>)', DEFAULT: 'rgb(var(--brand) / <alpha-value>)', strong: 'rgb(var(--brand-strong) / <alpha-value>)' },
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
