import { createTheme } from '@mui/material/styles';

// Helper function to get CSS variable values
const getCssVar = (varName: string, fallback: string = '#000000') => {
  if (typeof document !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
  }
  return fallback;
};

// Create a comprehensive MUI theme with module-specific colors
const theme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode: mode,
    // Module-specific color palette aligned with the new corporate theme
    devoluciones: { // Corresponds to error
      main: getCssVar('--color-danger', '#DC2626'),
      light: getCssVar('--color-error-400', '#ef4444'),
      dark: getCssVar('--color-danger-700', '#b91c1c'),
      contrastText: '#ffffff'
    },
    pedido: { // Corresponds to primary
      main: getCssVar('--color-primary-700', '#0A3D62'),
      light: getCssVar('--color-primary-500', '#105F93'),
      dark: getCssVar('--color-primary-800', '#072C49'),
      contrastText: '#ffffff'
    },
    inventario: { // Corresponds to secondary
      main: getCssVar('--color-secondary-700', '#0D9488'),
      light: getCssVar('--color-secondary-600', '#10B9AA'),
      dark: getCssVar('--color-secondary-800', '#0A6F66'),
      contrastText: '#ffffff'
    },
    comparador: { // Corresponds to accent
      main: getCssVar('--color-accent-600', '#F4B400'),
      light: getCssVar('--color-accent-500', '#FFC30D'),
      dark: getCssVar('--color-accent-700', '#D19C00'),
      contrastText: '#000000'
    },

    // Standard MUI palette colors, aligned with the new theme
    primary: {
      main: getCssVar('--color-primary-700', '#0A3D62'),
      light: getCssVar('--color-primary-500', '#105F93'),
      dark: getCssVar('--color-primary-800', '#072C49'),
      contrastText: '#ffffff'
    },
    secondary: {
      main: getCssVar('--color-secondary-700', '#0D9488'),
      light: getCssVar('--color-secondary-600', '#10B9AA'),
      dark: getCssVar('--color-secondary-800', '#0A6F66'),
      contrastText: '#ffffff'
    },
    error: {
      main: getCssVar('--color-danger', '#DC2626'),
      light: getCssVar('--color-error-400', '#ef4444'),
      dark: getCssVar('--color-danger-700', '#b91c1c'),
      contrastText: '#ffffff'
    },
    info: {
      main: getCssVar('--color-info', '#3B82F6'),
      light: getCssVar('--color-primary-300', '#66A5D2'),
      dark: getCssVar('--color-primary-700', '#0A3D62'),
      contrastText: '#ffffff'
    },
    success: {
      main: getCssVar('--color-success-600', '#16A34A'),
      light: getCssVar('--color-success-500', '#22c55e'),
      dark: getCssVar('--color-success-700', '#15803d'),
      contrastText: '#ffffff'
    },
    text: {
      primary: mode === 'light' ? getCssVar('--color-text-primary', '#111827') : getCssVar('--color-text-inverse', '#f9fafb'),
      secondary: mode === 'light' ? getCssVar('--color-text-secondary', '#374151') : getCssVar('--color-text-secondary', '#d1d5db'),
      disabled: mode === 'light' ? getCssVar('--color-text-tertiary', '#9ca3af') : getCssVar('--color-text-tertiary', '#6b7280')
    },
    background: {
      default: mode === 'light' ? getCssVar('--color-bg-primary', '#f8f9fa') : getCssVar('--color-bg-dark', '#051E31'),
      paper: mode === 'light' ? getCssVar('--color-bg-secondary', '#ffffff') : getCssVar('--color-bg-tertiary', '#072C49')
    },
    grey: {
      50: getCssVar('--color-grey-50', '#f9fafb'),
      100: getCssVar('--color-grey-100', '#f3f4f6'),
      200: getCssVar('--color-grey-200', '#e5e7eb'),
      300: getCssVar('--color-grey-300', '#d1d5db'),
      400: getCssVar('--color-grey-400', '#9ca3af'),
      500: getCssVar('--color-grey-500', '#6b7280'),
      600: getCssVar('--color-grey-600', '#4b5563'),
      700: getCssVar('--color-grey-700', '#374151'),
      800: getCssVar('--color-grey-800', '#1f2937'),
      900: getCssVar('--color-grey-900', '#111827')
    }
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.25rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      color: mode === 'light' ? '#111827' : '#f9fafb'
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
      color: mode === 'light' ? '#111827' : '#f9fafb'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
      color: mode === 'light' ? '#111827' : '#f9fafb'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: mode === 'light' ? '#374151' : '#d1d5db'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: mode === 'light' ? '#374151' : '#d1d5db'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#111827' : '#f9fafb'
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#111827' : '#f9fafb',
          backgroundColor: mode === 'light' ? '#f3f4f6' : '#1f2937', // grey-100 : grey-800
          '&.Mui-focused': {
            color: mode === 'light' ? '#111827' : '#f9fafb'
          }
        },
        input: {
          '&::placeholder': {
            color: mode === 'light' ? '#6b7280' : '#9ca3af'
          }
        }
      }
    }
  }
});

export default theme;
