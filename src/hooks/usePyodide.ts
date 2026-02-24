/**
 * usePyodide - Hook para cargar y usar Pyodide (Python en el navegador)
 * 
 * Este hook carga Pyodide desde CDN y permite ejecutar código Python
 * directamente en el navegador, eliminando la necesidad del backend para
 * generación de Excel con fórmulas.
 * 
 * Uso:
 *   const { pyodide, isLoading, isReady, error } = usePyodide();
 *   
 *   if (isReady) {
 *     // Pyodide está listo para usar
 *     pyodide.runPython('print("Hola")');
 *   }
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface PyodideInterface {
  runPython: (code: string) => unknown;
  loadPackage: (packages: string[] | string) => Promise<void>;
  FS?: {
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string) => Uint8Array;
  };
  globals?: {
    get: (name: string) => unknown;
  };
}

interface UsePyodideOptions {
  autoLoad?: boolean;
  packages?: string[];
}

interface UsePyodideReturn {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  loadPyodide: () => Promise<void>;
  runPython: ((code: string) => Promise<unknown>) | null;
}

// Definir la interfaz global para window.loadPyodide
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full';

export function usePyodide(options: UsePyodideOptions = {}): UsePyodideReturn {
  const { autoLoad = false, packages = ['pandas', 'openpyxl'] } = options;
  
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const loadedRef = useRef(false);
  const loadingRef = useRef(false);

  const loadPyodide = useCallback(async () => {
    // Siempre permitir reintentar si hay error previo
    if (pyodide && loadedRef.current) {
      console.log('Pyodide ya cargado');
      return;
    }

    if (loadingRef.current) {
      console.log('Ya está cargando...');
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Intentando cargar Pyodide desde:', PYODIDE_CDN);
      
      // Cargar el script de Pyodide desde CDN
      if (!window.loadPyodide) {
        console.log('📥 Cargando script de Pyodide...');
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `${PYODIDE_CDN}/pyodide.js`;
          script.async = true;
          script.onload = () => {
            console.log('✅ Script de Pyodide cargado');
            resolve();
          };
          script.onerror = () => reject(new Error('Error al cargar el script de Pyodide desde CDN'));
          document.head.appendChild(script);
        });
      }

      if (!window.loadPyodide) {
        throw new Error('Pyodide no está disponible en window.loadPyodide');
      }

      // Inicializar Pyodide
      console.log('⚙️ Inicializando Pyodide...');
      const py = await window.loadPyodide({
        indexURL: PYODIDE_CDN,
      });
      console.log('✅ Pyodide inicializado');

      // Cargar paquetes necesarios
      console.log('📦 Cargando paquetes:', packages);
      await py.loadPackage(packages);
      console.log('✅ Paquetes cargados');

      loadedRef.current = true;
      setPyodide(py);
      setIsReady(true);
      console.log('✅ Pyodide completamente cargado y listo');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar Pyodide';
      console.error('❌ Error cargando Pyodide:', errorMessage);
      setError(errorMessage);
      loadedRef.current = false; // Permitir reintentar
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [pyodide, packages]);

  const runPythonCode = useCallback(async (code: string): Promise<unknown> => {
    if (!pyodide) {
      throw new Error('Pyodide no está cargado');
    }
    return pyodide.runPython(code);
  }, [pyodide]);

  // Cargar automáticamente si autoLoad es true
  useEffect(() => {
    if (autoLoad && !pyodide && !isLoading && !loadedRef.current) {
      loadPyodide();
    }
  }, [autoLoad, pyodide, isLoading, loadPyodide]);

  return {
    pyodide,
    isLoading,
    error,
    isReady,
    loadPyodide,
    runPython: isReady ? runPythonCode : null,
  };
}

/**
 * Verifica si Pyodide está disponible en el navegador
 * sin necesidad de cargarlo
 */
export function isPyodideSupported(): boolean {
  // Pyodide requiere WebAssembly
  const hasWebAssembly = typeof WebAssembly !== 'undefined';
  
  // Pero Pyodide puede funcionar en navegadores modernos
  return hasWebAssembly;
}

export default usePyodide;
