/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  // Dark mode is driven by data-theme="light" on <html>; default (no attr) is dark.
  // We can't use Tailwind dark: variants reliably since the site uses CSS custom
  // properties for theming. Instead we use the CSS vars directly via custom colors.
  theme: {
    extend: {
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        site: {
          bg:      'var(--color-light)',
          surface: 'var(--color-surface)',
          border:  'var(--color-border)',
          text:    'var(--color-primary)',
          muted:   'var(--color-secondary)',
          accent:  'var(--color-accent)',
        },
      },
      typography: () => ({
        eleoro: {
          css: {
            '--tw-prose-body':        'var(--color-primary)',
            '--tw-prose-headings':    'var(--color-primary)',
            '--tw-prose-lead':        'var(--color-secondary)',
            '--tw-prose-links':       'var(--color-accent)',
            '--tw-prose-bold':        'var(--color-primary)',
            '--tw-prose-counters':    'var(--color-secondary)',
            '--tw-prose-bullets':     'var(--color-accent)',
            '--tw-prose-hr':          'var(--color-border)',
            '--tw-prose-quotes':      'var(--color-primary)',
            '--tw-prose-quote-borders': 'var(--color-accent)',
            '--tw-prose-captions':    'var(--color-secondary)',
            '--tw-prose-code':        'var(--color-accent)',
            '--tw-prose-pre-code':    'var(--color-primary)',
            '--tw-prose-pre-bg':      'var(--color-surface)',
            '--tw-prose-th-borders':  'var(--color-border)',
            '--tw-prose-td-borders':  'var(--color-border)',
          },
        },
      }),
    },
  },
  plugins: [typography()],
};
