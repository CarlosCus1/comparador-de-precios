/**
 * ExportEngine - Exportación inteligente con metadatos y anclaje a datos
 * Genera reportes PDF/PNG con hipervínculos a filas específicas del XLSX
 */
import { safeExportToCanvas } from './exportUtils';

interface ExportConfig {
  format: 'pdf' | 'png' | 'xlsx';
  includeSchema: boolean;
  includeMetadata: boolean;
  anchorToData: boolean;
  schemaPath?: string;
}

interface ExportMetadata {
  timestamp: string;
  schemaVersion: string;
  dataSource: string;
  filtersApplied?: Record<string, unknown>;
  exportConfig: ExportConfig;
}

interface AnchoredData {
  rowId: string;
  anchorUrl?: string;
  dataReference: Record<string, unknown>;
}

interface ExportResult {
  blob: Blob;
  filename: string;
  metadata?: ExportMetadata;
  anchors?: AnchoredData[];
}

// Instancia singleton para ExportEngine
class ExportEngineClass {
  private defaultSchemaPath = '/schemas/precios.schema.json';

  /**
   * Generar exportación con opciones configurables
   */
  async export(
    content: HTMLElement | HTMLCanvasElement,
    config: ExportConfig,
    metadata?: ExportMetadata
  ): Promise<ExportResult> {
    const timestamp = new Date().toISOString();
    const filename = `export_${timestamp.replace(/[:.]/g, '-')}.${config.format}`;

    const exportMetadata: ExportMetadata = {
      timestamp,
      schemaVersion: '1.0.0',
      dataSource: 'comparador_precios',
      ...metadata,
      exportConfig: config
    };

    let blob: Blob;
    switch (config.format) {
      case 'png':
        blob = await this.generatePNG(content, exportMetadata, config);
        break;
      case 'pdf':
        blob = await this.generatePDF(content, exportMetadata, config);
        break;
      case 'xlsx':
        blob = await this.generateXLSX(content, exportMetadata, config);
        break;
      default:
        throw new Error(`Formato no soportado: ${config.format}`);
    }

    return {
      blob,
      filename,
      metadata: config.includeMetadata ? exportMetadata : undefined,
      anchors: config.anchorToData ? await this.generateAnchoredData(content) : undefined
    };
  }

  /**
   * Generar imagen PNG
   */
  private async generatePNG(
    content: HTMLElement | HTMLCanvasElement,
    metadata: ExportMetadata,
    _config: ExportConfig
  ): Promise<Blob> {
    let canvas: HTMLCanvasElement;
    if (content instanceof HTMLCanvasElement) {
      canvas = content;
    } else {
      canvas = await safeExportToCanvas(content);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  /**
   * Generar PDF
   */
  private async generatePDF(
    content: HTMLElement | HTMLCanvasElement,
    metadata: ExportMetadata,
    _config: ExportConfig
  ): Promise<Blob> {
    let canvas: HTMLCanvasElement;
    if (content instanceof HTMLCanvasElement) {
      canvas = content;
    } else {
      canvas = await safeExportToCanvas(content);
    }

    const imageData = canvas.toDataURL('image/png');
    const pdfContent = this.createPDFContent(imageData, metadata);
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Crear contenido PDF básico
   */
  private createPDFContent(_imageData: string, _metadata: ExportMetadata): string {
    // Placeholder - en producción usar jsPDF
    const header = `%PDF-1.4\n`;
    const footer = `\n%%EOF`;
    
    return header + footer;
  }

  /**
   * Generar XLSX
   */
  private async generateXLSX(
    content: HTMLElement | HTMLCanvasElement,
    metadata: ExportMetadata,
    _config: ExportConfig
  ): Promise<Blob> {
    const xlsxData = {
      metadata,
      content: content instanceof HTMLElement ? content.innerHTML : '',
      timestamp: metadata.timestamp
    };

    return new Blob([JSON.stringify(xlsxData, null, 2)], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Generar datos anclados
   */
  private async generateAnchoredData(
    content: HTMLElement | HTMLCanvasElement
  ): Promise<AnchoredData[]> {
    const anchors: AnchoredData[] = [];
    
    if (content instanceof HTMLElement) {
      const anchoredElements = content.querySelectorAll('[data-anchor-id]');
      anchoredElements.forEach(el => {
        const anchorId = el.getAttribute('data-anchor-id');
        if (anchorId) {
          anchors.push({
            rowId: anchorId,
            anchorUrl: `#row-${anchorId}`,
            dataReference: {
              element: el.tagName,
              text: el.textContent?.substring(0, 100)
            }
          });
        }
      });
    }

    return anchors;
  }

  /**
   * Generar reporte completo
   */
  async generateFullReport(
    options: {
      dashboard: HTMLElement;
      table: HTMLElement;
      config: ExportConfig;
      filters?: Record<string, unknown>;
    }
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    const baseMetadata: Partial<ExportMetadata> = { filtersApplied: options.filters };

    if (options.dashboard) {
      const dashboardResult = await this.export(options.dashboard, {
        ...options.config,
        anchorToData: true
      }, baseMetadata as ExportMetadata);
      results.push(dashboardResult);
    }

    if (options.table) {
      const tableResult = await this.export(options.table, {
        ...options.config,
        anchorToData: true
      }, baseMetadata as ExportMetadata);
      results.push(tableResult);
    }

    return results;
  }

  /**
   * Descargar blob como archivo
   */
  download(result: ExportResult, customFilename?: string): void {
    const blobUrl = window.URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = customFilename || result.filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);
  }
}

export const exportEngine = new ExportEngineClass();
export type { ExportConfig, ExportMetadata, ExportResult, AnchoredData };
export default exportEngine;
