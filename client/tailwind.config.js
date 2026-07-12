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
          50: '#eef1fd',
          100: '#dbe1fb',
          400: '#5b7bea',
          500: '#3B5FE3',
          600: '#2f4bc0',
          700: '#25399a'
        },
        accent: {
          400: '#a78bfa',
          500: '#8B5CF6',
          600: '#7c3aed'
        },
        success: '#10B981',
        surface: {
          light: '#F8F9FC',
          dark: '#0B0E17',
          darkCard: '#131725'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3B5FE3 0%, #8B5CF6 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(59,95,227,0.12) 0%, rgba(139,92,246,0.12) 100%)'
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 41, 88, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.35)'
      },
      borderRadius: {
        card: '1.25rem'
      }
    }
  },
  plugins: []
};
