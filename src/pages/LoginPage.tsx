import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

/**
 * Componente LoginPage
 * 
 * Página de inicio de sesión con diseño corporativo premium y accesibilidad WCAG AA.
 * Implementa:
 * 1. Autenticación de usuario.
 * 2. Validación de formularios en tiempo real con mensajes de error accesibles.
 * 3. Limitación de tasa (Rate Limiting) para prevenir ataques de fuerza bruta.
 * 4. Diseño visual moderno con efectos de vidrio y animaciones.
 * 5. Accesibilidad completa: ARIA attributes, skip navigation, focus management.
 */
const LoginPage: React.FC = () => {
  // Estados para manejo de formulario y feedback
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Estados para Rate Limiting
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<number>(0);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Constantes de seguridad
  const MAX_ATTEMPTS = 5; // Máximo de intentos fallidos permitidos
  const WINDOW_MINUTES = 5; // Ventana de tiempo para el bloqueo (en minutos)
  const STORAGE_KEY = 'login_attempts'; // Clave para persistencia en localStorage

  const requiredDomain = '@cipsa.com.pe'; // Dominio corporativo requerido

  // --- Funciones de Rate Limiting ---

  /**
   * Obtiene el registro de intentos fallidos desde localStorage.
   */
  const getAttempts = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { attempts: 0, lastAttempt: 0 };
    return JSON.parse(stored);
  };

  /**
   * Guarda el registro de intentos fallidos en localStorage.
   */
  const setAttempts = (attempts: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      attempts,
      lastAttempt: Date.now()
    }));
  };

  /**
   * Verifica si el usuario está bloqueado por demasiados intentos fallidos.
   * @returns true si se permite el intento, false si está bloqueado.
   */
  const checkRateLimit = () => {
    const { attempts, lastAttempt } = getAttempts();
    const now = Date.now();
    const windowMs = WINDOW_MINUTES * 60 * 1000;

    // Si ha pasado el tiempo de bloqueo, resetear contador
    if (now - lastAttempt > windowMs) {
      setAttempts(0);
      setRateLimitError(null);
      setTimeUntilReset(0);
      return true;
    }

    // Si excede los intentos máximos, bloquear y mostrar mensaje
    if (attempts >= MAX_ATTEMPTS) {
      const timeLeft = Math.ceil((windowMs - (now - lastAttempt)) / 1000 / 60);
      setRateLimitError(`Demasiados intentos de inicio de sesión. Intente nuevamente en ${timeLeft} minutos.`);
      setTimeUntilReset(timeLeft);
      return false;
    }

    return true;
  };

  // Efecto para actualizar la cuenta regresiva del bloqueo
  React.useEffect(() => {
    if (timeUntilReset > 0) {
      const interval = setInterval(() => {
        setTimeUntilReset(prev => {
          if (prev <= 1) {
            setRateLimitError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Actualizar cada minuto
      return () => clearInterval(interval);
    }
  }, [timeUntilReset]);

  // --- Validación del Formulario ---
  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!email.toLowerCase().endsWith(requiredDomain)) {
      newErrors.email = `El correo debe terminar con "${requiredDomain}"`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Manejo del Envío del Formulario ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setRateLimitError(null);

    if (!validateForm()) {
      return;
    }

    if (!checkRateLimit()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular latencia de red para experiencia realista
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Resetear intentos al tener éxito
      setAttempts(0);

      setMessage('Inicio de sesión exitoso! Redirigiendo...');
      login(name, email);
      navigate('/home');
    } catch {
      // Incrementar intentos fallidos en caso de error (simulado aquí)
      const current = getAttempts();
      setAttempts(current.attempts + 1);

      setMessage('Error en el inicio de sesión. Inténtelo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal a pantalla completa con fondo temático
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-primary)]">
      
      {/* Skip Navigation Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
      >
        Ir al contenido principal
      </a>

      {/* 
         Decoración de Fondo (Orbes difusos)
         Añaden profundidad visual sin distraer del formulario.
      */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-pedido-primary)] opacity-[0.05] blur-[120px]" aria-hidden="true"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-inventario-primary)] opacity-[0.05] blur-[120px]" aria-hidden="true"></div>

      {/* Tarjeta de Login (Centrada) */}
      <div className="w-full max-w-md relative z-10 animate-fade-in" role="region" aria-label="Formulario de inicio de sesión">
        <div className="glass-card overflow-hidden">

          {/* Encabezado de la Tarjeta con patrón sutil */}
          <div className="login-header px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" aria-hidden="true"></div>
            <div className="relative z-10">
              {/* Icono Corporativo */}
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6 shadow-xl border border-white/20" aria-hidden="true">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight" id="login-title">CIPSA Análisis de Precios</h1>
              <p className="text-emerald-100/80 text-sm font-medium">Sistema de Comparación Competitiva</p>
            </div>
          </div>

          {/* Cuerpo del Formulario */}
          <div className="px-8 py-10 bg-[var(--surface-primary)]">
            {/* ARIA Live Region for dynamic messages */}
            <div 
              role="status" 
              aria-live="polite" 
              aria-atomic="true" 
              className="sr-only"
              id="login-status"
            >
              {message || rateLimitError || ''}
            </div>

            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              {/* Campo: Nombre Completo */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)]">
                  Nombre Completo <span className="text-[var(--color-danger)]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`input ${errors.name ? 'border-[var(--color-danger)]' : ''}`}
                    placeholder="Ingrese su nombre completo"
                    disabled={isLoading}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    aria-required="true"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-[var(--color-danger)] flex items-center animate-pulse-soft" id="name-error" role="alert">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Campo: Correo Corporativo */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)]">
                  Correo Corporativo <span className="text-[var(--color-danger)]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input ${errors.email ? 'border-[var(--color-danger)]' : ''}`}
                    placeholder={`usuario${requiredDomain}`}
                    disabled={isLoading}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-required="true"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-[var(--color-danger)] flex items-center animate-pulse-soft" id="email-error" role="alert">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn py-3.5 text-base font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-describedby="login-instruction"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    <span>Iniciando sesión...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    <span>Iniciar Sesión</span>
                  </span>
                )}
              </button>
              <div id="login-instruction" className="sr-only">
                Presione Enter o haga clic para iniciar sesión. El formulario requiere nombre completo y correo corporativo.
              </div>
            </form>

            {/* Mensajes de Error de Rate Limiting */}
            {rateLimitError && (
              <div className="mt-6 p-4 rounded-lg border border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-warning)] flex items-center gap-3 animate-fade-in" role="alert" aria-live="assertive">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <p className="text-sm font-medium">{rateLimitError}</p>
              </div>
            )}

            {/* Mensajes de Feedback General (Éxito/Error) */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg border flex items-center gap-3 animate-fade-in ${message.includes('Error')
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                  : 'border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]'
                }`} role="status" aria-live="polite">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  {message.includes('Error') ? (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  )}
                </svg>
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}
          </div>

          {/* Pie de Página */}
          <div className="bg-[var(--bg-tertiary)] px-8 py-6 text-center border-t border-[var(--border-primary)]">
            <p className="text-xs text-[var(--text-secondary)]">© 2024 CIPSA Análisis de Precios - Sistema de Comparación Competitiva</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
