/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3166',
        },
        neutral: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Admin dashboard tokens — reference CSS variables set by [data-app="admin"]
        db: {
          bg:         'var(--db-bg)',
          sidebar:    'var(--db-sidebar)',
          topbar:     'var(--db-topbar)',
          surface:    'var(--db-surface)',
          elevated:   'var(--db-elevated)',
          hover:      'var(--db-hover)',
          border:     'var(--db-border)',
          'border-hi':'var(--db-border-hi)',
          text1:      'var(--db-text-1)',
          text2:      'var(--db-text-2)',
          text3:      'var(--db-text-3)',
          accent:     'var(--db-accent)',
          'accent-soft': 'var(--db-accent-soft)',
          'accent-text': 'var(--db-accent-text)',
          success:    'var(--db-success)',
          warning:    'var(--db-warning)',
          error:      'var(--db-error)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
};
