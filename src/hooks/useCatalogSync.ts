import { useState, useCallback, useEffect, useRef } from 'react';
import { sessionCache } from '../utils/sessionCache';
import { getCatalogFromIndexedDB, saveCatalogToIndexedDB, getCacheStats } from '../utils/indexedDb';
import { useToasts } from './useToasts';
import { useAppStore } from '../store/useAppStore';

export const useCatalogSync = (enableBackendSync = true, backendStatus: { isActive: boolean }) => {
  const { addToast } = useToasts();
  const { catalogCount } = useAppStore();
  const [lastCatalogUpdate, setLastCatalogUpdate] = useState<Date | null>(() => {
    const cachedTimestamp = sessionCache.get<number>('last_catalog_update');
    return cachedTimestamp ? new Date(cachedTimestamp) : null;
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const isUpdatingRef = useRef(false);

  // Función para cargar catálogo desde cache local
  const loadFromCache = useCallback(async () => {
    try {
      const cachedCatalog = await getCatalogFromIndexedDB();
      if (cachedCatalog && cachedCatalog.length > 0) {
        console.log(`📦 useCatalogSync: Cargando ${cachedCatalog.length} productos desde cache local`);
        // Actualizar el store directamente
        useAppStore.setState({ 
          catalogo: cachedCatalog, 
          catalogCount: cachedCatalog.length 
        });
        
        const cacheStats = await getCacheStats();
        if (cacheStats.catalogSize) {
          addToast(
            `Catálogo cargado desde cache: ${cacheStats.catalogSize} productos`,
            'info'
          );
        }
        return true;
      }
    } catch (error) {
      console.warn('⚠️ useCatalogSync: Error cargando desde cache:', error);
    }
    return false;
  }, [addToast]);

  const syncCatalogWithBackend = useCallback(async () => {
    if (!enableBackendSync || isUpdatingRef.current) return false;
    if (!backendStatus.isActive) {
      console.log('⚠️ useCatalogSync: Backend no disponible, intentando cargar desde cache');
      return await loadFromCache();
    }

    try {
      isUpdatingRef.current = true;
      console.log('🔄 useCatalogSync: Sincronizando catálogo con backend...');

      // Obtener el estado actual antes de la carga
      const currentState = useAppStore.getState();
      const hadCatalogBefore = currentState.catalogo.length > 0;

      // Usar el método del store que maneja la lógica de frescura
      await currentState.cargarCatalogo();
      
      // Verificar si el catálogo se actualizó
      const newState = useAppStore.getState();
      if (newState.catalogo.length > 0) {
        // Guardar en cache local para uso offline
        await saveCatalogToIndexedDB(newState.catalogo);
        console.log('✅ useCatalogSync: Catálogo sincronizado y guardado en cache');
        
        const updateTime = new Date();
        setLastCatalogUpdate(updateTime);
        sessionCache.set('last_catalog_update', updateTime.getTime());
        
        // Si antes no había catálogo, mostrar notificación
        if (!hadCatalogBefore) {
          return true;
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ useCatalogSync: Error en sincronización de catálogo:', error);
      // Fallback a cache en caso de error
      return await loadFromCache();
    } finally {
      isUpdatingRef.current = false;
    }
  }, [enableBackendSync, backendStatus.isActive, loadFromCache]);

  const showCatalogUpdateNotification = useCallback((count?: number) => {
    const notificationTime = new Date();
    const formattedTime = notificationTime.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const productCount = count || catalogCount;
    addToast(
      `Catálogo actualizado: ${productCount} elementos a las ${formattedTime}`,
      'success'
    );

    setLastCatalogUpdate(current => current || notificationTime);
  }, [addToast, catalogCount]);

  // Inicialización mejorada
  useEffect(() => {
    const initializeCatalog = async () => {
      if (isInitialized) return;
      
      console.log('🚀 useCatalogSync: Inicializando catálogo...');
      
      // Primero intentar cargar desde cache para startup rápido
      const loadedFromCache = await loadFromCache();
      
      // Luego intentar sincronizar con backend si está disponible
      if (enableBackendSync && backendStatus.isActive) {
        const syncSuccess = await syncCatalogWithBackend();
        if (syncSuccess && !loadedFromCache) {
          const stats = await getCacheStats();
          if (stats.catalogSize) {
            showCatalogUpdateNotification(stats.catalogSize);
          }
        }
      }
      
      setIsInitialized(true);
    };

    // Delay inicial para mejor UX
    const timeoutId = setTimeout(initializeCatalog, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isInitialized, enableBackendSync, backendStatus.isActive, loadFromCache, syncCatalogWithBackend, showCatalogUpdateNotification]);

  // Sincronización periódica mejorada
  useEffect(() => {
    if (!enableBackendSync || isUpdatingRef.current) return;

    const performPeriodicSync = async () => {
      if (isUpdatingRef.current) return;
      
      const stats = await getCacheStats();
      const needsUpdate = !stats.catalogSize || stats.catalogSize === 0;
      
      if (needsUpdate) {
        console.log('🔄 useCatalogSync: Sincronización periódica - cache vacío o expirado');
        const success = await syncCatalogWithBackend();
        if (success && stats.catalogSize) {
          showCatalogUpdateNotification();
        }
      }
    };

    // Sincronización cada 6 horas en lugar de 12 para mejor freshness
    const updateInterval = setInterval(performPeriodicSync, 6 * 60 * 60 * 1000);

    return () => clearInterval(updateInterval);
  }, [enableBackendSync, syncCatalogWithBackend, showCatalogUpdateNotification]);

  return { 
    lastCatalogUpdate, 
    isInitialized,
    cacheStats: getCacheStats
  };
};