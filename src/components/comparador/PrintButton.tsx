import React, { useState, useEffect } from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { PrintReport } from './PrintReport';
import { Button } from '../ui/Button';

interface PrintButtonProps {
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
  className?: string;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  products,
  competidores,
  datosGenerales,
  className
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  // Crear contenedor para impresión
  useEffect(() => {
    let container: HTMLDivElement | null = null;
    
    if (isPrinting) {
      container = document.createElement('div');
      container.id = 'print-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.zIndex = '9999';
      container.style.background = 'white';
      container.style.overflow = 'auto';
      container.style.display = 'none'; // Oculto inicialmente
      
      document.body.appendChild(container);

      // Preparar contenido para impresión
      setTimeout(() => {
        if (container) {
          // Activar modo impresión en body
          document.body.classList.add('print-mode');
          
          // Mostrar contenedor y trigger impresión
          container.style.display = 'block';
          window.print();
        }
      }, 100);

      return () => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
        document.body.classList.remove('print-mode');
        setIsPrinting(false);
      };
    }
  }, [isPrinting]);

  const handlePrint = async () => {
    // Validaciones previas
    if (!products || products.length === 0) {
      console.error('No hay productos para imprimir');
      return;
    }

    if (!competidores || competidores.length === 0) {
      console.error('No hay competidores configurados');
      return;
    }

    try {
      setIsPrinting(true);
      console.log('Preparando reporte para impresión...');
      
      // Esperar a que se renderice el contenido
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error al preparar impresión:', error);
      setIsPrinting(false);
    }
  };

  const handlePrintPDF = () => {
    // Alternativa para exportar a PDF usando librerías externas
    // Esta función puede integrarse con jsPDF o html2pdf
    console.log('Funcionalidad de exportación PDF en desarrollo');
  };

  return (
    <>
      <div className={`print-controls ${className || ''}`}>
        <Button
          onClick={handlePrint}
          disabled={isPrinting}
          className="print-btn-primary"
          style={{
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isPrinting ? 'not-allowed' : 'pointer',
            opacity: isPrinting ? 0.7 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {isPrinting ? (
            <>
              <span className="spinner mr-2">⟳</span>
              Preparando...
            </>
          ) : (
            <>
              📄 Imprimir Reporte
            </>
          )}
        </Button>

        <Button
          onClick={handlePrintPDF}
          variant="outline"
          className="print-btn-secondary"
          style={{
            borderColor: '#2563EB',
            color: '#2563EB',
            backgroundColor: 'transparent',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            marginLeft: '10px'
          }}
        >
          📋 Exportar PDF
        </Button>
      </div>

      {/* Contenedor oculto para impresión */}
      {isPrinting && (
        <div>
          <PrintReport
            products={products}
            competidores={competidores}
            datosGenerales={datosGenerales}
          />
        </div>
      )}
    </>
  );
};

/* Estilos CSS para el botón de impresión */
const printButtonStyles = `
  .print-controls {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
  }

  .print-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    background-color: #1E40AF;
  }

  .print-btn-secondary:hover {
    background-color: #2563EB;
    color: white;
    transform: translateY(-2px);
  }

  .spinner {
    display: inline-block;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Estilos para modo impresión */
  .print-mode {
    background-color: white !important;
  }

  .print-mode * {
    background-color: transparent !important;
    color: black !important;
    border-color: black !important;
  }

  /* Asegurar que los botones no se impriman */
  .print-controls, .print-controls * {
    display: none !important;
  }
`;

// Insertar estilos en el head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printButtonStyles;
  document.head.appendChild(style);
}