import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

/**
 * Propiedades del componente Layout.
 * @property children - Los componentes hijos que se renderizarán dentro del layout (el contenido de la página).
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Componente Layout Principal
 * 
 * Este componente define la estructura base de la aplicación para usuarios autenticados.
 * Incluye:
 * 1. Fondo decorativo animado.
 * 2. Barra de navegación (Navbar) con efecto "Glassmorphism" (vidrio esmerilado).
 * 3. Menú de usuario desplegable.
 * 4. Contenedor principal para el contenido de las páginas.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Hooks de autenticación y navegación
  const { logout, userName, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar la visibilidad del menú de usuario
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<number>(-1);

  // Refs para manejo de foco
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /**
    * Manejador de cierre de sesión.
    * Solicita confirmación al usuario antes de cerrar la sesión y redirigir al login.
    */
  const handleLogoutClick = () => {
    if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
      logout();
      navigate('/');
    }
  };

  /**
   * Manejador de teclado para el menú de usuario
   */
  const handleUserMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!showUserMenu) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setShowUserMenu(false);
        userMenuButtonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveMenuItem(prev => prev < 0 ? 0 : Math.min(prev + 1, 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveMenuItem(prev => prev <= 0 ? 0 : prev - 1);
        break;
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault();
          setActiveMenuItem(0);
        }
        break;
    }
  };

  /**
   * Manejador de clic fuera del menú
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setActiveMenuItem(-1);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Renderizar la barra de navegación solo si el usuario está autenticado.
  // Esto permite usar el mismo Layout para páginas públicas (si las hubiera) sin mostrar la navbar.
  const shouldShowNavbar = isLoggedIn;

  return (
    // Contenedor raíz con transición suave de colores y tipografía base
    <div className="min-h-screen relative transition-colors duration-500 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">

      {/* 
         Decoración de Fondo 
         Elementos visuales abstractos (círculos difusos) que añaden profundidad y dinamismo.
         Usan 'pointer-events-none' para no interferir con la interacción del usuario.
      */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-pedido-primary)] opacity-[0.03] blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-inventario-primary)] opacity-[0.03] blur-[100px]"></div>
      </div>

      {/* Barra de Navegación (Navbar) */}
      {shouldShowNavbar && (
        // 'sticky top-0': Mantiene la navbar visible al hacer scroll.
        // 'glass': Aplica el efecto de vidrio esmerilado definido en design-system.css.
        <header className="sticky top-0 z-50 w-full glass border-b border-[var(--border-glass)]" role="navigation" aria-label="Barra de navegación principal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

            {/* Logo y Título de la Aplicación */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/home')}>
                {/* Icono con gradiente y sombra suave */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                {/* Título con efecto de texto gradiente */}
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                  CIPSA Análisis de Precios
                </h1>
              </div>
              
              {/* Enlaces de Navegación - MEJORADO */}
              <nav className="flex items-center gap-1 md:gap-2">
                {/* Botón Análisis Competitivo */}
                <button
                  onClick={() => navigate('/comparador')}
                  className={`px-4 md:px-5 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 flex items-center gap-2 relative group ${
                    location.pathname === '/comparador'
                      ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                  aria-label="Ir a Análisis Competitivo de Precios"
                  title="Análisis Competitivo"
                >
                  {/* Icono de Análisis */}
                  <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">Análisis Competitivo</span>
                  
                  {/* Badge de activo */}
                  {location.pathname === '/comparador' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                  )}
                </button>

                {/* Separador visual */}
                <div className="hidden md:block w-px h-6 bg-[var(--border-primary)] mx-1"></div>

                {/* Botón Análisis de Margen */}
                <button
                  onClick={() => navigate('/margen')}
                  className={`px-4 md:px-5 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 flex items-center gap-2 relative group ${
                    location.pathname === '/margen'
                      ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                  aria-label="Ir a Análisis de Margen"
                  title="Análisis de Margen"
                >
                  {/* Icono de Margen */}
                  <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Análisis de Margen</span>
                  
                  {/* Badge de activo */}
                  {location.pathname === '/margen' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                  )}
                </button>
              </nav>
            </div>

            {/* Menú de Usuario */}
            <div className="relative">
              <button
                ref={userMenuButtonRef}
                onClick={() => setShowUserMenu(!showUserMenu)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowUserMenu(!showUserMenu);
                  }
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all duration-200 border border-transparent hover:border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                aria-controls="user-menu"
                aria-label={`Menú de usuario, ${userName}`}
              >
                {/* Información del usuario (visible en desktop) */}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">{userName}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Usuario</p>
                </div>
                {/* Avatar con inicial */}
                <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-pedido-primary)] to-[var(--color-pedido-dark)] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* Icono de flecha (chevron) animado */}
                <svg className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown del Menú de Usuario */}
              {showUserMenu && (
                <>
                  {/* Overlay invisible para cerrar el menú al hacer click fuera */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} aria-hidden="true"></div>

                  {/* Contenedor del dropdown con animación de entrada */}
                  <div
                    className="absolute right-0 mt-2 w-56 glass-card overflow-hidden z-50 animate-fade-in origin-top-right"
                    role="menu"
                    id="user-menu"
                    aria-labelledby="user-menu-button"
                    ref={userMenuRef}
                  >
                    <div className="px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]">
                      <p className="text-sm font-medium text-[var(--text-primary)]">Conectado como</p>
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{userName}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleLogoutClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-[var(--color-danger)] hover:bg-[var(--color-devoluciones-surface)] flex items-center gap-3 transition-colors focus:outline-none focus:bg-[var(--color-devoluciones-surface)]"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                        </svg>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Área Principal de Contenido */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        {children}
      </main>
    </div>
  );
};

export default Layout;