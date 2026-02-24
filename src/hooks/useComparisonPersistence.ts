import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getComparisonState, saveComparisonState, clearComparisonState, type ComparisonState } from '../utils/indexedDb';

/**
 * Hook para persistir y restaurar el estado de comparación de precios
 * Permite recuperar el trabajo guardado después de recargas de página o cierres accidentales
 */
export const useComparisonPersistence = () => {
  const {
    listas,
    formState,
    catalogo,
    agregarProductoToLista,
    actualizarProductoEnLista,
    actualizarFormulario
  } = useAppStore();

  const isRestoringRef = useRef(false);
  const lastSaveRef = useRef<number>(0);
  const autoSaveTimeoutRef = useRef<number | null>(null);

  // Función para capturar el estado actual
  const captureCurrentState = useCallback((): Omit<ComparisonState, 'timestamp'> | null => {
    try {
      const productos = listas.precios;
      const competidores: string[] = [];
      
      // Extraer competidores del formState
      for (let i = 1; i <= 5; i++) {
        const marcaKey = `marca${i}` as keyof typeof formState.precios;
        const marca = formState.precios[marcaKey];
        if (typeof marca === 'string' && marca.trim() !== '') {
          competidores.push(marca.trim());
        }
      }

      if (productos.length === 0 && Object.keys(formState.precios).length === 0) {
        return null; // No hay nada que guardar
      }

      return {
        productos,
        competidores,
        formData: formState.precios
      };
    } catch (error) {
      console.warn('⚠️ useComparisonPersistence: Error capturando estado:', error);
      return null;
    }
  }, [listas.precios, formState.precios]);

  // Función para guardar estado con debouncing
  const saveState = useCallback(async (immediate = false) => {
    const now = Date.now();
    
    // Evitar guardado muy frecuente (debounce de 2 segundos)
    if (!immediate && now - lastSaveRef.current < 2000) {
      return;
    }

    const state = captureCurrentState();
    if (!state) {
      await clearComparisonState();
      return;
    }

    try {
      await saveComparisonState(state);
      lastSaveRef.current = now;
      console.log('💾 useComparisonPersistence: Estado guardado');
    } catch (error) {
      console.warn('⚠️ useComparisonPersistence: Error guardando estado:', error);
    }
  }, [captureCurrentState]);

  // Función para programar guardado automático
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      saveState(false);
    }, 3000); // Guardar 3 segundos después del último cambio
  }, [saveState]);

  // Función para restaurar estado
  const restoreState = useCallback(async (): Promise<boolean> => {
    if (isRestoringRef.current) return false;

    try {
      console.log('🔄 useComparisonPersistence: Intentando restaurar estado...');
      const savedState = await getComparisonState();
      
      if (!savedState) {
        console.log('ℹ️ useComparisonPersistence: No hay estado guardado');
        return false;
      }

      isRestoringRef.current = true;

      // Restaurar formulario
      if (savedState.formData) {
        Object.entries(savedState.formData).forEach(([key, value]) => {
          actualizarFormulario(key as keyof typeof formState.precios, String(value));
        });
      }

      // Restaurar productos uno por uno para activar los efectos correctamente
      for (const producto of savedState.productos) {
        agregarProductoToLista({
          codigo: producto.codigo,
          nombre: producto.nombre,
          cod_ean: producto.cod_ean,
          ean_14: producto.ean_14,
          peso: producto.peso,
          stock_referencial: producto.stock_referencial,
          linea: producto.linea,
          keywords: producto.keywords
        });

        // Restaurar precios si existen
        if (producto.precios && Object.keys(producto.precios).length > 0) {
          Object.entries(producto.precios).forEach(([competidor, precio]) => {
            actualizarProductoEnLista(producto.codigo, 'precios', { ...producto.precios, [competidor]: precio });
          });
        }

        // Restaurar precio sugerido
        if (producto.precio_sugerido !== undefined) {
          actualizarProductoEnLista(producto.codigo, 'precio_sugerido', producto.precio_sugerido);
        }

        // Restaurar cantidad
        if (producto.cantidad !== undefined) {
          actualizarProductoEnLista(producto.codigo, 'cantidad', producto.cantidad);
        }
      }

      isRestoringRef.current = false;
      
      console.log(`✅ useComparisonPersistence: Estado restaurado (${savedState.productos.length} productos)`);
      return true;
    } catch (error) {
      isRestoringRef.current = false;
      console.warn('⚠️ useComparisonPersistence: Error restaurando estado:', error);
      return false;
    }
  }, [agregarProductoToLista, actualizarProductoEnLista, actualizarFormulario, formState.precios]);

  // Guardar automáticamente cuando cambie el estado
  useEffect(() => {
    if (!isRestoringRef.current && catalogo.length > 0) {
      scheduleAutoSave();
    }
  }, [listas.precios, formState.precios, catalogo.length, scheduleAutoSave]);

  // Restaurar estado al montar el componente
  useEffect(() => {
    const performRestore = async () => {
      const restored = await restoreState();
      if (restored) {
        // Programar primer guardado después de restauración
        setTimeout(() => saveState(true), 1000);
      }
    };

    // Delay para asegurar que el store esté inicializado
    const timeoutId = setTimeout(performRestore, 500);
    return () => clearTimeout(timeoutId);
  }, [restoreState, saveState]);

  // Limpiar timeout en unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Funciones públicas
  const clearState = useCallback(async () => {
    await clearComparisonState();
    console.log('🗑️ useComparisonPersistence: Estado guardado eliminado');
  }, []);

  const forceSave = useCallback(() => {
    saveState(true);
  }, [saveState]);

  return {
    restoreState,
    clearState,
    forceSave
  };
};