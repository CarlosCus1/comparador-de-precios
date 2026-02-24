/**
 * PyExcelExportButton - Botón de exportación con Pyodide (Python en el navegador)
 * 
 * Este componente proporciona un botón para exportar Excel usando Python+openpyxl
 * en el navegador, con fallback automático al backend si Pyodide no está disponible.
 * 
 * Uso:
 *   <PyExcelExportButton 
 *     data={data} 
 *     onExportStart={() => ...}
 *     onExportComplete={() => ...}
 *     onError={() => ...}
 *   />
 */

import React, { useState, useCallback } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { usePyodide } from '../hooks/usePyodide';
import { generateExcelWithPyodide, type ExcelData, downloadBlob } from '../utils/pyExcelGenerator';
import type { PreciosExport } from '../api/schemas';
import { exportApi } from '../utils/api';

interface PyExcelExportButtonProps {
  /** Datos para exportar */
  data: {
    productos: ExcelData['productos'];
    marcas: string[];
    cliente: string;
    documento?: string;
    codigo_cliente?: string;
    sucursal?: string;
    responsable?: string;
    fecha?: string;
    selectedColumns?: string[];
  };
  /** Texto del botón */
  label?: string;
  /** Callback al iniciar exportación */
  onExportStart?: () => void;
  /** Callback al completar exportación */
  onExportComplete?: () => void;
  /** Callback en caso de error */
  onError?: (error: Error) => void;
  /** Usar método legacy (backend) en lugar de Pyodide */
  useLegacy?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Mostrar indicador de carga */
  isLoading?: boolean;
}

export const PyExcelExportButton: React.FC<PyExcelExportButtonProps> = ({
  data,
  label = 'Exportar Excel (Python)',
  onExportStart,
  onExportComplete,
  onError,
  useLegacy = false,
  disabled = false,
  isLoading: externalLoading = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMethod, setExportMethod] = useState<'pyodide' | 'legacy' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar Pyodide automáticamente
  const { isReady, isLoading: pyodideLoading, error: pyodideError, loadPyodide } = usePyodide({
    autoLoad: false, // No cargar automáticamente para no consumir recursos
  });

  const handleExport = useCallback(async () => {
    if (disabled || isExporting || externalLoading) return;

    setIsExporting(true);
    setError(null);
    onExportStart?.();

    try {
      // Intentar usar Pyodide si no se especifica legacy
      if (!useLegacy) {
        try {
          console.log('🔄 Intentando exportar con Pyodide...');
          setExportMethod('pyodide');

          // Cargar Pyodide si no está listo
          if (!isReady) {
            await loadPyodide();
          }

          // Si después de cargar sigue sin estar listo, fallar
          if (!isReady) {
            throw new Error('Pyodide no está disponible');
          }

          // Generar Excel con Pyodide
          const blob = await generateExcelWithPyodide(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).pyodide || { 
              runPython: async (_code: string) => {
                // Si window.pyodide no existe, necesitamos cargarlo primero
                void _code;
                throw new Error('Pyodide no está inicializado');
              }
            },
            data
          );

          // Descargar el archivo
          const filename = `comparador_${data.cliente?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'cliente'}_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`;
          downloadBlob(blob, filename);

          console.log('✅ Exportación con Pyodide exitosa');
          onExportComplete?.();
          setIsExporting(false);
          return;
        } catch (pyError) {
          console.warn('⚠️ Pyodide falló, usando método legacy:', pyError);
          setExportMethod('legacy');
        }
      } else {
        setExportMethod('legacy');
      }

      // Fallback: usar el backend actual
      console.log('🔄 Exportando con backend legacy...');
      
      // Transformar datos al formato esperado por el backend
      const list = data.productos.map(p => ({
        ...p,
        linea: '',
        peso: 0,
        stock_referencial: 0,
        keywords: [],
        cantidad: 1,
      }));
      
      const payload = {
        tipo: 'precios' as const,
        form: {
          cliente: data.cliente,
          documento_cliente: data.documento,
          codigo_cliente: data.codigo_cliente,
          sucursal: data.sucursal,
          // Agregar marcas
          ...Object.fromEntries(data.marcas.map((m, i) => [`marca${i + 1}`, m])),
        },
        list,
        usuario: { nombre: data.responsable || '', correo: '' },
        totales: { totalElementos: data.productos.length },
        data: { selectedColumns: data.selectedColumns },
      };

      const { blob, filename } = await exportApi(payload as unknown as PreciosExport, 'xlsx');

      // Descargar el archivo
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      console.log('✅ Exportación con backend exitosa');
      onExportComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error en exportación:', errorMessage);
      setError(errorMessage);
          onError?.(new Error(errorMessage));
    } finally {
      setIsExporting(false);
    }
  }, [data, disabled, isExporting, externalLoading, useLegacy, isReady, loadPyodide, onExportStart, onExportComplete, onError]);

  const isCurrentlyLoading = isExporting || pyodideLoading || externalLoading;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExport}
        disabled={disabled || isCurrentlyLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
          ${disabled || isCurrentlyLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 text-white'
          }
        `}
      >
        {isCurrentlyLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        <span>
          {isCurrentlyLoading 
            ? 'Generando...' 
            : label
          }
        </span>
      </button>

      {/* Indicador de método */}
      {exportMethod && (
        <span className="text-xs text-gray-500">
          Método: {exportMethod === 'pyodide' ? 'Python (navegador)' : 'Backend (servidor)'}
        </span>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Estado de Pyodide */}
      {pyodideError && !useLegacy && (
        <span className="text-xs text-orange-500">
          ⚠️ Pyodide no disponible: {pyodideError}
        </span>
      )}
    </div>
  );
};

export default PyExcelExportButton;
