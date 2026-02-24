
import type { PedidoExport, InventarioExport, DevolucionesExport, PreciosExport } from '../api/schemas';
import type { ICalcularApiParams, ICalcularApiResponse } from '../interfaces';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';


export const calcularApi = async (params: ICalcularApiParams): Promise<ICalcularApiResponse> => {
  const { montoTotal, fechasValidas } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        montoTotal,
        fechasValidas,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el cálculo de la API');
    }

    const data: ICalcularApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling calcularApi:', error);
    throw error;
  }
};

type ExportPayload = PedidoExport | InventarioExport | DevolucionesExport | PreciosExport;

export const exportApi = async (payload: ExportPayload, export_format: 'xlsx' | 'pdf' | 'png' = 'xlsx'): Promise<{ blob: Blob; filename: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, export_format }),
    });

    if (!response.ok) {
      let errorMessage = 'Error desconocido al exportar el archivo';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Backend validation error details:', errorData);
      } catch {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = '';
    if (export_format === 'pdf') {
        filename = 'reporte.pdf';
    } else if (export_format === 'png') {
        filename = 'reporte.png';
    } else {
        filename = 'reporte.xlsx';
    }

    if (contentDisposition) {
      // Intenta extraer filename* (UTF-8) o filename estándar
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
        if (filename.toLowerCase().startsWith("utf-8''")) {
          filename = decodeURIComponent(filename.substring(7));
        }
      }
    }

    const blob = await response.blob();
    return { blob, filename };
  } catch (error) {
    console.error(`Error calling exportApi with format ${export_format}:`, error);
    throw error;
  }
};


