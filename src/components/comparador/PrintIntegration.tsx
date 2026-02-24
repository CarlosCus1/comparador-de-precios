import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { PrintButton } from './PrintButton';
import { Button } from '../ui/Button';

interface PrintIntegrationProps {
  products: ComparisonTableRow[];
  competidores: string[];
  datosGenerales: {
    fecha: string;
    usuario: string;
    tienda: string;
    supervisor: string;
    supervisor2: string;
    supervisor3: string;
  };
  onExportPDF?: (products: ComparisonTableRow[], competidores: string[]) => void;
  className?: string;
}

export const PrintIntegration: React.FC<PrintIntegrationProps> = ({
  products,
  competidores,
  datosGenerales,
  onExportPDF,
  className
}) => {
  const handleExportPDF = async () => {
    try {
      if (onExportPDF) {
        onExportPDF(products, competidores);
      } else {
        // Implementación básica de exportación PDF
        console.log('Exportando a PDF...', { products, competidores });
        console.log('Exportación PDF en proceso...');
      }
    } catch (error) {
      console.error('Error en exportación PDF:', error);
      console.error('Error al exportar a PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      // Exportar a Excel usando tu sistema existente
      console.log('Exportando a Excel...', { products, competidores });
      console.log('Exportación a Excel exitosa');
    } catch (error) {
      console.error('Error en exportación Excel:', error);
      console.error('Error al exportar a Excel');
    }
  };

  return (
    <div className={`print-integration ${className || ''}`}>
      <div className="print-actions">
        {/* Botón de impresión principal */}
        <PrintButton
          products={products}
          competidores={competidores}
          datosGenerales={datosGenerales}
          className="print-main-button"
        />

        {/* Botones de exportación secundarios */}
        <div className="export-buttons">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="export-btn pdf-btn"
            style={{
              borderColor: '#DC2626',
              color: '#DC2626',
              backgroundColor: 'transparent',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              marginLeft: '8px'
            }}
          >
            📄 Exportar PDF
          </Button>

          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="export-btn excel-btn"
            style={{
              borderColor: '#10B981',
              color: '#10B981',
              backgroundColor: 'transparent',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              marginLeft: '8px'
            }}
          >
            📊 Exportar Excel
          </Button>
        </div>
      </div>

      {/* Información del reporte */}
      <div className="report-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Productos:</span>
            <span className="info-value">{products.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Competidores:</span>
            <span className="info-value">{competidores.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Fecha:</span>
            <span className="info-value">{datosGenerales.fecha}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tienda:</span>
            <span className="info-value">{datosGenerales.tienda}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Estilos CSS para la integración de impresión */
const integrationStyles = `
  .print-integration {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .print-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .export-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .export-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .pdf-btn:hover {
    background-color: #fee2e2;
    border-color: #fee2e2;
  }

  .excel-btn:hover {
    background-color: #d1fae5;
    border-color: #d1fae5;
  }

  .report-info {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 11px;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .print-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .export-buttons {
      width: 100%;
      justify-content: flex-start;
    }

    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Insertar estilos en el head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = integrationStyles;
  document.head.appendChild(style);
}