import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from './ui/Button';

interface ExportTestProps {
  children: React.ReactNode;
  filename?: string;
}

export const ExportTest: React.FC<ExportTestProps> = ({ children, filename = 'test-export' }) => {
  const exportRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = async () => {
    if (!exportRef.current) return;

    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: 'var(--color-bg-secondary)',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (el instanceof HTMLElement) {
              el.style.color = computedStyle.color;
              el.style.backgroundColor = computedStyle.backgroundColor;
              el.style.borderColor = computedStyle.borderColor;
            }
          });
        }
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error al exportar PNG. Verifique que el contenido sea visible.');
    }
  };

  const handleExportPDF = async () => {
    if (!exportRef.current) return;

    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: 'var(--color-bg-secondary)',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (el instanceof HTMLElement) {
              el.style.color = computedStyle.color;
              el.style.backgroundColor = computedStyle.backgroundColor;
              el.style.borderColor = computedStyle.borderColor;
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar PDF. Verifique que el contenido sea visible.');
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Button onClick={handleExportPNG} variant="outline">
          Exportar PNG
        </Button>
        <Button onClick={handleExportPDF} variant="outline">
          Exportar PDF
        </Button>
      </div>
      
      <div ref={exportRef} className="export-test-content">
        {children}
      </div>
    </div>
  );
};