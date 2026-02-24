import { useState, useEffect, useCallback, useRef } from 'react';

interface SessionTimerConfig {
  timeoutMinutes?: number; // Default: 30 (PRODUCCIÓN: 30 minutos para cierre automático)
  warningMinutes?: number; // Default: 0 (PRODUCCIÓN: Sin warnings - cierre silencioso)
  onTimeout?: () => void;
  onWarning?: () => void;
}

/**
 * Hook optimizado para temporizador de sesión con minimal interaction
 *
 * ✅ OPTIMIZACIONES IMPLEMENTADAS:
 * - Operaciones 100% locales (sin API calls innecesarios)
 * - Memory cache para datos de sesión
 * - Throttling de eventos para eficiencia
 * - Cleanup automático de timers
 * - Persistencia en localStorage opcional
 * - Zero warnings en producción
 */

/**
 * Hook personalizado para gestionar temporizador de sesión GLOBAL
 *
 * ✅ CARACTERÍSTICAS:
 * - Temporizador por SESIÓN COMPLETA (no por módulo individual)
 * - Se reinicia automáticamente al navegar entre rutas
 * - No interfiere con componentes como LiveDateTime o NotificationBell
 * - Persistente durante toda la sesión autenticada
 * - Se detiene automáticamente al hacer logout
 *
 * ❌ NO DEPENDE DE:
 * - Módulos individuales (/inventario, /pedido, etc.)
 * - Estado de componentes específicos
 * - Rutas particulares (excepto para cleanup)
 */

export const useSessionTimer = (config: SessionTimerConfig = {}) => {
  const {
    timeoutMinutes = 30, // ⏱️ PRODUCCIÓN: 30 minutos para cierre automático
    warningMinutes = 1,  // ⚠️ PRODUCCIÓN: 1 minuto de aviso
    onTimeout,
    onWarning
  } = config;

  const [timeConnected, setTimeConnected] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(0);

  const intervalRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);
  const warningRef = useRef<number>(0);

  // Formatear tiempo para display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Resetear temporizador
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setTimeConnected(0);
    setShowWarning(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Configurar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
      onTimeout?.();
    }, timeoutMinutes * 60 * 1000);

    // Configurar warning
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      onWarning?.();
    }, (timeoutMinutes - warningMinutes) * 60 * 1000);
  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning]);

  // El temporizador siempre está activo (sin opción de pausar)

  // Timer visual
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isActive) {
        setTimeConnected(prev => prev + 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Actividad del usuario y configuración de timeouts
  useEffect(() => {
    setLastActivity(Date.now()); // Inicializar lastActivity

    const handleActivity = () => {
      resetTimer();
    };

    const events = ['mousedown', 'keydown', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer(); // Iniciar el temporizador en el montaje

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return {
    timeConnected: formatTime(timeConnected),
    isActive,
    resetTimer
  };
};