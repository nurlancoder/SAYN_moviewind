/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          'dark': '#0D0D1D',
          'darker': '#060608',
          'blue': '#00BFFF',
          'red': '#FF3131',
          'accent': '#1A1A2E',
          'glass': 'rgba(255, 255, 255, 0.1)',
        }
      },
      backdropBlur: {
        'glass': '16px',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'cinema-gradient': 'linear-gradient(135deg, #0D0D1D 0%, #1A1A2E 50%, #00BFFF 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00BFFF 0%, #FF3131 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px #00BFFF' },
          'to': { boxShadow: '0 0 30px #00BFFF, 0 0 40px #00BFFF' },
        },
        slideUp: {
          'from': { transform: 'translateY(100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};