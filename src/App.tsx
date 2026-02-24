import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ComparadorPage } from './pages/ComparadorPage';
import { MarginCalculatorPage } from './pages/MarginCalculatorPage';
import { useToasts } from './hooks/useToasts';
import ToastContainer from './components/ui/ToastContainer';
import { ToastContext } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/auth';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppStore } from './store/useAppStore';
import theme from './theme/muiTheme';

// --- Componente de Ruta Protegida ---
// Verifica si el usuario está autenticado antes de renderizar el contenido.
// Si no lo está, redirige a la página de inicio de sesión.
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// --- Wrapper de Tema ---
// Gestiona la aplicación del tema (claro/oscuro) tanto para Material UI como para CSS variables.
// Sincroniza el estado del tema de Zustand con la clase 'dark' en el elemento raíz HTML.
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentTheme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme]);

  const muiTheme = createTheme(theme(currentTheme));

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* Normaliza estilos CSS base */}
      {children}
    </ThemeProvider>
  );
};

// --- Componente Principal de la Aplicación ---
function App() {
  const { toasts, addToast, removeToast } = useToasts();

  return (
    // Jerarquía de Proveedores de Contexto
    <ToastContext.Provider value={{ addToast }}>
      <AuthProvider>
        <ThemeWrapper>
          <Layout>
            {/* Definición de Rutas */}
            <Routes>
              {/* Ruta Pública: Login */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<Navigate to="/" replace />} />

              {/* Rutas Protegidas */}
              <Route path="/home" element={<ProtectedRoute><Navigate to="/comparador" replace /></ProtectedRoute>} />
              <Route path="/comparador" element={<ProtectedRoute><ComparadorPage /></ProtectedRoute>} />
              <Route path="/margen" element={<ProtectedRoute><MarginCalculatorPage /></ProtectedRoute>} />

              {/* Ruta por defecto (404) -> Redirigir a Login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Contenedor de Notificaciones Toast */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
          </Layout>
        </ThemeWrapper>
      </AuthProvider>
    </ToastContext.Provider>
  );
}
export default App;
