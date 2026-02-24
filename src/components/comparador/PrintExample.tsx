import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { PrintIntegration } from './PrintIntegration';
import { Button } from '../ui/Button';

interface PrintExampleProps {
  products: ComparisonTableRow[];
  competidores: string[];
}

export const PrintExample: React.FC<PrintExampleProps> = ({ products, competidores }) => {
  // Datos de ejemplo para el reporte
  const datosGenerales = {
    fecha: new Date().toLocaleDateString('es-ES'),
    usuario: 'Juan Pérez',
    tienda: 'Tienda Principal - Lima Centro',
    supervisor: 'María González',
    supervisor2: 'Carlos Rodríguez',
    supervisor3: 'Ana Martínez'
  };

  // Función para exportar a PDF (puedes integrar con jsPDF o html2pdf)
  const handleExportPDF = (products: ComparisonTableRow[], competidores: string[]) => {
    console.log('Exportando a PDF con jsPDF o html2pdf...', { products, competidores });
    // Aquí iría la lógica de exportación real
  };

  // Función para exportar a Excel (usando tu sistema existente)
  const handleExportExcel = () => {
    console.log('Exportando a Excel usando tu sistema existente...');
    // Aquí iría la lógica de exportación a Excel
  };

  return (
    <div className="print-example">
      {/* Controles de impresión */}
      <PrintIntegration
        products={products}
        competidores={competidores}
        datosGenerales={datosGenerales}
        onExportPDF={handleExportPDF}
        className="mb-6"
      />

      {/* Botón de impresión rápido */}
      <div className="quick-actions">
        <Button
          onClick={() => {
            // Lógica para impresión rápida
            console.log('Imprimiendo reporte rápido...');
          }}
          className="quick-print-btn"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            marginRight: '10px'
          }}
        >
          🖨️ Imprimir Todo
        </Button>

        <Button
          onClick={handleExportExcel}
          variant="outline"
          className="quick-excel-btn"
          style={{
            borderColor: '#10b981',
            color: '#10b981',
            backgroundColor: 'transparent',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          📊 Exportar Excel
        </Button>
      </div>

      {/* Vista previa del reporte (opcional) */}
      <div className="report-preview mt-6">
        <h3 className="preview-title">Vista Previa del Reporte</h3>
        <div className="preview-content">
          <p className="preview-text">
            Este es un resumen de lo que se imprimirá:
          </p>
          <ul className="preview-list">
            <li>Portada con datos generales y estadísticas</li>
            <li>Resumen ejecutivo con gráfico de pastel</li>
            <li>Tarjetas de análisis de productos (5 por página)</li>
            <li>Gráficos optimizados para impresión</li>
            <li>Tablas de precios comparativos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/* Estilos CSS para el ejemplo de impresión */
const exampleStyles = `
  .print-example {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .quick-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .quick-print-btn:hover {
    background-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .quick-excel-btn:hover {
    background-color: #d1fae5;
    border-color: #d1fae5;
    transform: translateY(-2px);
  }

  .report-preview {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
  }

  .preview-title {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 12px 0;
  }

  .preview-content {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
  }

  .preview-text {
    font-size: 14px;
    color: #334155;
    margin: 0 0 12px 0;
  }

  .preview-list {
    margin: 0;
    padding-left: 20px;
    color: #475569;
  }

  .preview-list li {
    font-size: 13px;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .quick-actions {
      flex-direction: column;
      align-items: flex-start;
    }

    .quick-print-btn, .quick-excel-btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

// Insertar estilos en el head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = exampleStyles;
  document.head.appendChild(style);
}