/**
 * Hook para integración de datos en tiempo real
 * Conexión directa con esquema XLSX para actualizaciones automáticas
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface RealTimeConfig {
  url?: string;
  schemaPath: string;
  refreshInterval?: number;
  enableWebSocket?: boolean;
}

interface RealTimeData<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
  refresh: () => Promise<void>;
  subscribe: (callback: (data: T) => void) => () => void;
}

// Tipos para caché
interface CacheEntry<T> {
  id: string;
  data: T;
  timestamp: number;
  type: string;
}

// Colores para estado de conexión (accesibilidad)
const CONNECTION_STATUS = {
  connected: { color: '#10B981', label: 'Conectado' },
  connecting: { color: '#F59E0B', label: 'Conectando...' },
  disconnected: { color: '#DC2626', label: 'Desconectado' },
  error: { color: '#DC2626', label: 'Error de conexión' }
};

// Cache TTL en ms
const CACHE_TTL = 60000;

// DB setup
const DB_NAME = 'realtime_cache_db';
const STORE_NAME = 'cache_store';
let db: IDBDatabase | null = null;

async function ensureDB(): Promise<IDBDatabase> {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });
}

async function getCachedData<T>(id: string): Promise<T | null> {
  try {
    const database = await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result as CacheEntry<T> | undefined;
        if (result && Date.now() - result.timestamp < CACHE_TTL) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function saveCachedData<T>(id: string, data: T, type: string): Promise<void> {
  try {
    const database = await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, data, timestamp: Date.now(), type });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Silently fail
  }
}

export function useRealTimeData<T>(config: RealTimeConfig): RealTimeData<T> {
  const { 
    url, 
    schemaPath, 
    refreshInterval = 30000, 
    enableWebSocket = false 
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Set<(data: T) => void>>(new Set());
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Validación de esquema (simplificada para el cliente)
  const validateSchema = useCallback((input: unknown): input is T => {
    if (!input || typeof input !== 'object') return false;
    return true;
  }, []);

  // Carga de datos desde caché o API
  const loadData = useCallback(async (showLoading = true): Promise<void> => {
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const cachedData = await getCachedData<T>(schemaPath);
      if (cachedData && validateSchema(cachedData)) {
        setData(cachedData);
        setLastUpdated(new Date());
        setIsConnected(true);
        if (showLoading) setIsLoading(false);
        return;
      }

      if (url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json() as T;
        
        if (validateSchema(result)) {
          await saveCachedData(schemaPath, result, 'realtime');
          setData(result);
          setLastUpdated(new Date());
          setIsConnected(true);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setIsConnected(false);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [url, schemaPath, validateSchema]);

  // Suscripción a actualizaciones
  const subscribe = useCallback((callback: (data: T) => void) => {
    subscribersRef.current.add(callback);
    if (data) callback(data);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, [data]);

  // Notificar a todos los suscriptores
  const notifySubscribers = useCallback((newData: T) => {
    subscribersRef.current.forEach(callback => callback(newData));
  }, []);

  // WebSocket para tiempo real
  useEffect(() => {
    if (!enableWebSocket || !url) return;

    const wsUrl = url.replace(/^http/, 'ws');
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[RealTime] WebSocket conectado');
      };

      ws.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          if (validateSchema(newData)) {
            setData(newData);
            setLastUpdated(new Date());
            notifySubscribers(newData);
          }
        } catch (err) {
          console.error('[RealTime] Error parseando mensaje:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[RealTime] WebSocket desconectado');
      };

      ws.onerror = () => {
        setIsConnected(false);
        setError('Error de WebSocket');
      };

      return () => {
        ws.close();
      };
    } catch (err) {
      console.error('[RealTime] Error conectando WebSocket:', err);
    }
  }, [enableWebSocket, url, validateSchema, notifySubscribers]);

  // Intervalo de refresh
  useEffect(() => {
    if (enableWebSocket || refreshInterval <= 0) return;

    refreshTimerRef.current = setInterval(() => {
      loadData(false);
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [enableWebSocket, refreshInterval, loadData]);

  // Carga inicial
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    isConnected,
    refresh: () => loadData(true),
    subscribe
  };
}

// Hook para estado de conexión con accesibilidad
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    const interval = setInterval(() => {
      // Lógica de detección de estado
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statusInfo = CONNECTION_STATUS[status];

  return {
    status,
    statusInfo,
    setStatus,
    ariaLive: `Estado de conexión: ${statusInfo.label}`
  };
}

export default useRealTimeData;
