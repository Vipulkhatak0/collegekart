/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      colors: {
        primary: {
          50: '#eef2f7',
          100: '#d9e2ed',
          400: '#5b7fae',
          500: '#142B4A',
          600: '#10233c',
          700: '#0c1b2e'
        },
        accent: {
          400: '#6e91bd',
          500: '#3768A6',
          600: '#2d568b'
        },
        success: '#10B981',
        surface: {
          light: '#F6F7F9',
          dark: '#111a27',
          darkCard: '#172334'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #142B4A 0%, #3768A6 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(20,43,74,0.08) 0%, rgba(55,104,166,0.08) 100%)'
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 41, 88, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.35)'
      },
      borderRadius: {
        card: '0.5rem'
      }
    }
  },
  plugins: []
};
