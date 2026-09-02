import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#C5A059',
        tertiary: '#F4F4F2',
        neutral: '#666666',
      },
      fontFamily: {
        primary: ['Arial', 'sans-serif'],
      },
      fontSize: {
        sm: '10.4px',
        md: '13px',
        lg: '14px',
        xl: '14.4px',
        '2xl': '15px',
        '3xl': '16px',
        '4xl': '17px',
      },
      spacing: {
        '1': '2px',
        '2': '5px',
        '3': '8px',
        '4': '10px',
        '5': '12px',
        '6': '14px',
        '7': '15px',
        '8': '16px',
      },
      borderRadius: {
        xs: '2px',
        sm: '3px',
        md: '4px',
        lg: '5px',
        xl: '50px',
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
