import { useState, useCallback, useEffect } from 'react';
import { sessionCache } from '../utils/sessionCache';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

interface BackendStatus {
  isActive: boolean;
  lastSync: Date | null;
  error: string | null;
  isLoading: boolean;
}

export const useBackendSync = (enableBackendSync = true) => {
  // Detectar si estamos en GitHub Pages (sin backend disponible)
  const isGitHubPages = !import.meta.env.VITE_BACKEND_URL;
  const shouldSync = enableBackendSync && !isGitHubPages;

  const [backendStatus, setBackendStatus] = useState<BackendStatus>(() => {
    const cachedLastSync = sessionCache.get<number>('last_backend_check');
    return {
      isActive: false,
      lastSync: cachedLastSync ? new Date(cachedLastSync) : null,
      error: null,
      isLoading: false
    };
  });

  const checkBackendStatus = useCallback(async () => {
    if (!shouldSync) return;

    setBackendStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendStatus({
          isActive: true,
          lastSync: new Date(),
          error: null,
          isLoading: false
        });
        console.log('✅ useBackendSync: Backend activo y sincronizado');
      } else {
        throw new Error(`Error HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ useBackendSync: Error de backend:', error);
      setBackendStatus({
        isActive: false,
        lastSync: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      });
    }
  }, [shouldSync]);

  useEffect(() => {
    if (shouldSync) {
      const lastCheck = sessionCache.get<number>('last_backend_check');
      const now = Date.now();

      if (!lastCheck || (now - lastCheck) > 5 * 60 * 1000) {
        checkBackendStatus();
      }
    }
  }, [checkBackendStatus, shouldSync]);

  const syncWithBackend = useCallback(async (timeConnected: number) => {
    if (!shouldSync) return;

    const lastSync = sessionCache.get<number>('last_session_sync');
    const now = Date.now();

    if (lastSync && (now - lastSync) < 10 * 60 * 1000) {
      console.log('⏭️ useBackendSync: Sync reciente, omitiendo');
      return;
    }

    try {
      console.log('🔄 useBackendSync: Sincronizando sesión con backend...');

      const response = await fetch(`${API_BASE_URL}/api/session/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionTime: timeConnected,
          lastActivity: new Date(),
          timestamp: Date.now(),
          source: 'session_timer'
        })
      });

      if (response.ok) {
        console.log('✅ useBackendSync: Sincronización exitosa');
        sessionCache.set('last_session_sync', now, 10 * 60 * 1000);
      } else {
        throw new Error(`Error de sincronización: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ useBackendSync: Error en sincronización:', error);
    }
  }, [shouldSync]);

  return { backendStatus, checkBackendStatus, syncWithBackend };
};