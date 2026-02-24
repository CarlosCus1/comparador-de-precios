/**
 * ExcelJSExportButton - Botón para exportar Excel con fórmulas usando ExcelJS
 * 
 * Este componente genera Excel con fórmulas activas usando JavaScript (ExcelJS).
 * Es más rápido y confiable que Pyodide.
 */

import React, { useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Tooltip } from './ui';
import { generateExcelWithExcelJS, downloadBlob, type ExcelProducto } from '../utils/excelJsGenerator';

interface ExcelJSExportButtonProps {
  productos: ExcelProducto[];
  marcas: string[];
  cliente: string;
  documento?: string;
  codigo_cliente?: string;
  sucursal?: string;
  responsable?: string;
  disabled?: boolean;
}

// Botón de exportación con ExcelJS (JavaScript)
export const ExcelJSExportButton: React.FC<ExcelJSExportButtonProps> = ({
  productos,
  marcas,
  cliente,
  documento,
  codigo_cliente,
  sucursal,
  responsable,
  disabled,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = useCallback(async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      // Generar Excel con ExcelJS
      const blob = await generateExcelWithExcelJS({
        productos,
        marcas,
        cliente,
        documento,
        codigo_cliente,
        sucursal,
        responsable,
        selectedColumns: [],
      });

      const filename = `comparador_${cliente?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'cliente'}_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`;
      downloadBlob(blob, filename);
      
      console.log('✅ Exportación con ExcelJS exitosa');
    } catch (error) {
      console.error('❌ Error con ExcelJS:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productos, marcas, cliente, documento, codigo_cliente, sucursal, responsable, disabled, isLoading]);

  return (
    <Tooltip content="Exportar reporte de comparación a Excel" position="top">
      <button
        onClick={handleExport}
        disabled={disabled || isLoading}
        className="btn btn-primary"
        aria-label={isLoading ? "Generando Excel..." : "Exportar reporte a Excel"}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generando...</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Download className="w-5 h-5" aria-hidden="true" />
            <span>Exportar XLSX</span>
          </span>
        )}
      </button>
    </Tooltip>
  );
};

export default ExcelJSExportButton;
