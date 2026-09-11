import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C5A059',
        tertiary: '#F4F4F2',
        neutral: '#666666',
      },
      fontFamily: {
        primary: ['Arial', 'sans-serif'],
      },
      transitionDuration: {
        instant: '100ms',
        fast: '200ms',
        normal: '300ms',
      },
    },
  },
  plugins: [],
}
