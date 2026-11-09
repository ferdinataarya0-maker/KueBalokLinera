/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: { DEFAULT: 'var(--background)' },
        foreground: { DEFAULT: 'var(--foreground)' },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: { DEFAULT: 'var(--border)' },
        input: { DEFAULT: 'var(--input)' },
        ring: { DEFAULT: 'var(--ring)' },
        brown: {
          50: 'var(--brown-50)',
          100: 'var(--brown-100)',
          200: 'var(--brown-200)',
          300: 'var(--brown-300)',
          400: 'var(--brown-400)',
          500: 'var(--brown-500)',
          600: 'var(--brown-600)',
          700: 'var(--brown-700)',
          800: 'var(--brown-800)',
          900: 'var(--brown-900)',
        },
        peach: {
          100: 'var(--peach-100)',
          200: 'var(--peach-200)',
          300: 'var(--peach-300)',
          400: 'var(--peach-400)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg: 'var(--success-bg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          bg: 'var(--warning-bg)',
        },
        error: {
          DEFAULT: 'var(--error)',
          bg: 'var(--error-bg)',
        },
        info: {
          DEFAULT: 'var(--info)',
          bg: 'var(--info-bg)',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 0.25rem)',
        lg: 'calc(var(--radius) + 0.25rem)',
        xl: 'calc(var(--radius) + 0.5rem)',
        '2xl': 'calc(var(--radius) + 1rem)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 1px 3px rgba(181, 101, 29, 0.08), 0 1px 2px rgba(181, 101, 29, 0.06)',
        'warm-md': '0 4px 12px rgba(181, 101, 29, 0.14), 0 2px 6px rgba(181, 101, 29, 0.10)',
        'warm-lg': '0 10px 30px rgba(181, 101, 29, 0.18), 0 4px 12px rgba(181, 101, 29, 0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};