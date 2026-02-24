/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Clases de módulos para evitar purging
    'module-comparador',

    // Botones por módulo
    'btn-module', 'btn-outline',

    // Inputs por módulo
    'input-module',

    // Superficies y cards
    'surface', 'surface-card', 'surface-elevated', 'glass',

    // Estados y animaciones
    'fade-in', 'slide-up', 'scale-in', 'interactive',

    // Utilidades de focus
    'focus-visible',

    // Grid responsive
    'grid-responsive',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Paleta corporativa moderna usando variables CSS
        'primary': {
          '50': 'var(--color-primary-50)',
          '100': 'var(--color-primary-100)',
          '200': 'var(--color-primary-200)',
          '300': 'var(--color-primary-300)',
          '400': 'var(--color-primary-400)',
          '500': 'var(--color-primary-500)',
          '600': 'var(--color-primary-600)',
          '700': 'var(--color-primary-700)',
          '800': 'var(--color-primary-800)',
          '900': 'var(--color-primary-900)',
        },
        'secondary': {
          '50': 'var(--color-secondary-50)',
          '100': 'var(--color-secondary-100)',
          '200': 'var(--color-secondary-200)',
          '300': 'var(--color-secondary-300)',
          '400': 'var(--color-secondary-400)',
          '500': 'var(--color-secondary-500)',
          '600': 'var(--color-secondary-600)',
          '700': 'var(--color-secondary-700)',
          '800': 'var(--color-secondary-800)',
          '900': 'var(--color-secondary-900)',
        },
        'accent': {
          '50': 'var(--color-accent-50)',
          '100': 'var(--color-accent-100)',
          '200': 'var(--color-accent-200)',
          '300': 'var(--color-accent-300)',
          '400': 'var(--color-accent-400)',
          '500': 'var(--color-accent-500)',
          '600': 'var(--color-accent-600)',
          '700': 'var(--color-accent-700)',
          '800': 'var(--color-accent-800)',
          '900': 'var(--color-accent-900)',
        },
        'success': {
          '50': 'var(--color-success-50)',
          '100': 'var(--color-success-100)',
          '200': 'var(--color-success-200)',
          '300': 'var(--color-success-300)',
          '400': 'var(--color-success-400)',
          '500': 'var(--color-success-500)',
          '600': 'var(--color-success-600)',
          '700': 'var(--color-success-700)',
          '800': 'var(--color-success-800)',
          '900': 'var(--color-success-900)',
        },
        'error': {
          '50': 'var(--color-error-50)',
          '100': 'var(--color-error-100)',
          '200': 'var(--color-error-200)',
          '300': 'var(--color-error-300)',
          '400': 'var(--color-error-400)',
          '500': 'var(--color-error-500)',
          '600': 'var(--color-error-600)',
          '700': 'var(--color-error-700)',
          '800': 'var(--color-error-800)',
          '900': 'var(--color-error-900)',
        },
        // Colores de texto y fondo para modo oscuro
        'text': {
          'light': {
            'primary': 'var(--color-text-primary)',
            'secondary': 'var(--color-text-secondary)',
            'disabled': 'var(--color-text-tertiary)',
          },
          'dark': {
            'primary': 'var(--color-text-inverse)',
            'secondary': 'var(--color-text-secondary)',
            'disabled': 'var(--color-text-tertiary)',
          }
        },
        'background': {
          'light': {
            'default': 'var(--color-bg-secondary)',
            'paper': 'var(--color-bg-primary)',
          },
          'dark': {
            'default': 'var(--color-bg-dark)',
            'paper': 'var(--color-bg-tertiary)',
          }
        },
        // Paleta de grises usando variables CSS
        'grey': {
          50: 'var(--color-grey-50)',
          100: 'var(--color-grey-100)',
          200: 'var(--color-grey-200)',
          300: 'var(--color-grey-300)',
          400: 'var(--color-grey-400)',
          500: 'var(--color-grey-500)',
          600: 'var(--color-grey-600)',
          700: 'var(--color-grey-700)',
          800: 'var(--color-grey-800)',
          900: 'var(--color-grey-900)'
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'outline': '0 0 0 3px rgba(66, 153, 225, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
