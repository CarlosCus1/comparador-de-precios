// --------------------------------------------------------------------------- #
//                                                                             #
//              src/utils/marginExcelExport.ts                                  #
//           Generador de Excel para Calculadora de Margen                     #
//                 Usa ExcelJS para fórmulas activas                            #
//                                                                             #
// --------------------------------------------------------------------------- //

import ExcelJS from 'exceljs';
import type { MarginProduct, MarginClient } from '../store/useMarginStore';

/**
 * Genera un archivo Excel con fórmulas activas para la calculadora de margen
 * Usa ExcelJS para crear fórmulas que recalculan automáticamente
 */

const currencyFormat = '#,##0.00';
const percentageFormat = '0.00%';

/**
 * Descarga un blob como archivo
 */
const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exporta los productos a un archivo Excel con fórmulas activas
 */
export const exportMarginToExcel = async (productos: MarginProduct[], cliente?: MarginClient): Promise<void> => {
  if (productos.length === 0) {
    throw new Error('No hay productos para exportar');
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Calculadora de Margen';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Calculadora Margen');

  // === DATOS DEL CLIENTE ===
  worksheet.getCell('A1').value = 'CLIENTE:';
  worksheet.getCell('A1').font = { bold: true };
  worksheet.getCell('B1').value = cliente?.nombre || '';

  worksheet.getCell('A2').value = 'DOCUMENTO:';
  worksheet.getCell('A2').font = { bold: true };
  worksheet.getCell('B2').value = cliente?.documento || '';

  worksheet.getCell('A3').value = 'RUC:';
  worksheet.getCell('A3').font = { bold: true };
  worksheet.getCell('B3').value = cliente?.ruc || '';

  worksheet.getCell('A4').value = 'FECHA:';
  worksheet.getCell('A4').font = { bold: true };
  worksheet.getCell('B4').value = new Date().toLocaleDateString('es-PE');

  // === ENCABEZADOS ===
  const headerRow = 6;
  const headers = [
    'Código', 
    'Producto', 
    'Costo (S/)', 
    'Precio Venta (S/)', 
    'Markup (%)', 
    'Margen (%)', 
    'Ganancia (S/)',
    '',  // Separador
    'Ingrese %',  // Columna I: Markup % input
    'Precio desde Markup',  // Columna J: Price from Markup
    'Ingrese %',  // Columna K: Margin % input
    'Precio desde Margen'  // Columna L: Price from Margin
  ];
  
  // Colores para encabezados - Mejora de contraste
  const headerColors: Record<number, string> = {
    1: '1F4E79',   // Código - Azul oscuro
    2: '1F4E79',   // Producto - Azul oscuro
    3: '2E7D32',   // Costo - Verde oscuro
    4: 'D84315',   // Precio - Naranja oscuro
    5: '1565C0',   // Markup - Azul
    6: '6A1B9A',   // Margen - Púrpura oscuro
    7: '2E7D32',   // Ganancia - Verde oscuro
    8: 'E0E0E0',   // Separador - Gris
    9: 'F57F17',   // Input Markup % - Ámbar oscuro
    10: 'E65100',  // Price from Markup - Naranja
    11: 'F57F17',  // Input Margin % - Ámbar oscuro
    12: '388E3C'   // Price from Margin - Verde
  };

  headers.forEach((header, index) => {
    const colNum = index + 1;
    const cell = worksheet.getCell(headerRow, colNum);
    cell.value = header;
    
    // Fuente blanca para headers oscuros, negra para claros
    const isLightHeader = colNum === 9 || colNum === 11; // Amarillo = claro
    cell.font = { bold: true, color: { argb: isLightHeader ? '000000' : 'FFFFFF' }, size: 11 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: headerColors[colNum] }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
  });

  // === DATOS Y FÓRMULAS ===
  const dataStartRow = headerRow + 1;
  
  productos.forEach((producto, index) => {
    const rowNum = dataStartRow + index;
    const row = worksheet.getRow(rowNum);
    
    // Columna A: Código
    row.getCell(1).value = producto.codigo || '';
    row.getCell(1).alignment = { horizontal: 'left' };
    
    // Columna B: Producto
    row.getCell(2).value = producto.nombre || '';
    row.getCell(2).alignment = { horizontal: 'left' };
    
    // Columna C: Costo
    const costoCell = row.getCell(3);
    costoCell.value = producto.costo ?? null;
    costoCell.numFmt = currencyFormat;
    costoCell.alignment = { horizontal: 'right' };
    costoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
    
    // Columna D: Precio Venta
    const precioCell = row.getCell(4);
    precioCell.value = producto.precio ?? null;
    precioCell.numFmt = currencyFormat;
    precioCell.alignment = { horizontal: 'right' };
    precioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } };
    
    // Columna E: Markup (%) - Fórmula: (Precio - Costo) / Costo
    // Excel percentage format already multiplies by 100, so we don't need *100
    const markupCell = row.getCell(5);
    markupCell.value = { 
      formula: `=IF(AND(C${rowNum}<>"",D${rowNum}<>""), (D${rowNum}-C${rowNum})/C${rowNum}, "")` 
    };
    markupCell.numFmt = percentageFormat;
    markupCell.alignment = { horizontal: 'right' };
    markupCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
    
    // Columna F: Margen (%) - Fórmula: (Precio - Costo) / Precio
    // Excel percentage format already multiplies by 100, so we don't need *100
    const margenCell = row.getCell(6);
    margenCell.value = { 
      formula: `=IF(AND(C${rowNum}<>"",D${rowNum}<>""), (D${rowNum}-C${rowNum})/D${rowNum}, "")` 
    };
    margenCell.numFmt = percentageFormat;
    margenCell.alignment = { horizontal: 'right' };
    margenCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E9D7F3' } };
    
    // Columna G: Ganancia (S/) - Fórmula: Precio - Costo
    const gananciaCell = row.getCell(7);
    gananciaCell.value = { 
      formula: `=IF(AND(C${rowNum}<>"",D${rowNum}<>""), D${rowNum}-C${rowNum}, "")` 
    };
    gananciaCell.numFmt = currencyFormat;
    gananciaCell.alignment = { horizontal: 'right' };
    gananciaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
    gananciaCell.font = { bold: true };
    
    // Columna H: Separador (vacío)
    const sepCell = row.getCell(8);
    sepCell.value = '';
    sepCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
    
    // Columna I: Input Markup % - usuario ingresa valor
    const inputMarkupCell = row.getCell(9);
    inputMarkupCell.value = null;  // Vacío para que usuario ingrese
    inputMarkupCell.numFmt = percentageFormat;
    inputMarkupCell.alignment = { horizontal: 'right' };
    inputMarkupCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } };
    inputMarkupCell.border = { top: { style: 'dashed' }, bottom: { style: 'dashed' } };
    
    // Columna J: Precio desde Markup - Fórmula: Costo × (1 + Markup%)
    const priceFromMarkupCell = row.getCell(10);
    priceFromMarkupCell.value = { 
      formula: `=IF(AND(C${rowNum}<>"",I${rowNum}<>""), C${rowNum}*(1+I${rowNum}), "")` 
    };
    priceFromMarkupCell.numFmt = currencyFormat;
    priceFromMarkupCell.alignment = { horizontal: 'right' };
    priceFromMarkupCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } };
    priceFromMarkupCell.font = { bold: true };
    
    // Columna K: Input Margin % - usuario ingresa valor
    const inputMarginCell = row.getCell(11);
    inputMarginCell.value = null;  // Vacío para que usuario ingrese
    inputMarginCell.numFmt = percentageFormat;
    inputMarginCell.alignment = { horizontal: 'right' };
    inputMarginCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } };
    inputMarginCell.border = { top: { style: 'dashed' }, bottom: { style: 'dashed' } };
    
    // Columna L: Precio desde Margen - Fórmula: Costo / (1 - Margen%)
    // Maneja caso de división por cero (margen >= 100%)
    const priceFromMarginCell = row.getCell(12);
    priceFromMarginCell.value = { 
      formula: `=IF(AND(C${rowNum}<>"",K${rowNum}<>"",K${rowNum}<1), C${rowNum}/(1-K${rowNum}), "")` 
    };
    priceFromMarginCell.numFmt = currencyFormat;
    priceFromMarginCell.alignment = { horizontal: 'right' };
    priceFromMarginCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
    priceFromMarginCell.font = { bold: true };
  });

  // Ancho de columnas
  worksheet.getColumn(1).width = 12;  // Código
  worksheet.getColumn(2).width = 35;   // Producto
  worksheet.getColumn(3).width = 15;   // Costo
  worksheet.getColumn(4).width = 16;  // Precio
  worksheet.getColumn(5).width = 12;   // Markup
  worksheet.getColumn(6).width = 12;   // Margen
  worksheet.getColumn(7).width = 14;   // Ganancia
  worksheet.getColumn(8).width = 3;    // Separador
  worksheet.getColumn(9).width = 12;   // Input Markup %
  worksheet.getColumn(10).width = 18;  // Precio desde Markup
  worksheet.getColumn(11).width = 12;  // Input Margin %
  worksheet.getColumn(12).width = 18;  // Precio desde Margen

  // === NOTAS INFORMATIVAS ===
  const noteRow = dataStartRow + productos.length + 2;
  worksheet.getCell(noteRow, 1).value = '📊 FÓRMULAS Y CÁLCULOS:';
  worksheet.getCell(noteRow, 1).font = { bold: true, size: 11 };
  
  const formulas = [
    '• Markup (%) = (Precio Venta - Costo) / Costo × 100 → Ejemplo: (12.50-10)/10×100 = 25%',
    '• Margen (%) = (Precio Venta - Costo) / Precio Venta × 100 → Ejemplo: (12.50-10)/12.50×100 = 20%',
    '• Ganancia (S/) = Precio Venta - Costo → Ejemplo: 12.50 - 10 = S/ 2.50',
    '',
    '--- CÁLCULO INVERSO ---',
    '• Precio desde Markup = Costo × (1 + Markup%) → Ejemplo: 10 × (1 + 0.25) = S/ 12.50',
    '• Precio desde Margen = Costo / (1 - Margen%) → Ejemplo: 10 / (1 - 0.20) = S/ 12.50',
    '',
    '💡 NOTA: El Markup mide la ganancia sobre el costo, el Margen mide la ganancia sobre el precio de venta.',
    '💡 Para las columnas de cálculo inverso, ingresa el % directamente (ej: 25 para 25%).',
    '💡 Si el Margen es >= 100%, la fórmula mostrará vacío para evitar división por cero.'
  ];
  
  formulas.forEach((text, index) => {
    worksheet.getCell(noteRow + 1 + index, 1).value = text;
    worksheet.getCell(noteRow + 1 + index, 1).font = { size: 10, color: { argb: '666666' } };
  });

  // Generar y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-PE').replace(/\//g, '-');
  const clientSuffix = cliente?.nombre ? `_${cliente.nombre.toLowerCase().replace(/\s+/g, '_')}` : '';
  const filename = `calculadora_margen${clientSuffix}_${dateStr}.xlsx`;

  downloadBlobFile(blob, filename);
};

/**
 * Genera un archivo CSV (fallback)
 */
const generateCSV = (productos: MarginProduct[], cliente?: MarginClient): string => {
  const headers = ['Código', 'Producto', 'Costo (S/)', 'Precio Venta (S/)', 'Markup (%)', 'Margen (%)', 'Ganancia (S/)'];
  const rows = productos.map(p => [
    p.codigo,
    p.nombre,
    p.costo ?? '',
    p.precio ?? '',
    p.markup ? p.markup.toFixed(2) : '',
    p.margen ? p.margen.toFixed(2) : '',
    p.costo && p.precio ? (p.precio - p.costo).toFixed(2) : '',
  ]);
  
  const clientInfo: string[] = [];
  if (cliente?.nombre) clientInfo.push(`Cliente: ${cliente.nombre}`);
  if (cliente?.documento) clientInfo.push(`Documento: ${cliente.documento}`);
  if (cliente?.ruc) clientInfo.push(`RUC: ${cliente.ruc}`);
  
  const csvContent = [
    ...clientInfo,
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * Exporta los productos a CSV
 */
export const exportMarginToCSV = (productos: MarginProduct[], cliente?: MarginClient): void => {
  if (productos.length === 0) {
    throw new Error('No hay productos para exportar');
  }
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-PE').replace(/\//g, '-');
  const clientSuffix = cliente?.nombre ? `_${cliente.nombre.toLowerCase().replace(/\s+/g, '_')}` : '';
  const filename = `calculadora_margen${clientSuffix}_${dateStr}.csv`;
  
  const csvContent = generateCSV(productos, cliente);
  
  // Agregar BOM para UTF-8
  const bom = '\uFEFF';
  const csvWithBom = bom + csvContent;
  
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8' });
  downloadBlobFile(blob, filename);
};

/**
 * Genera fórmulas Excel para referencia
 */
export const generateExcelFormulas = (): string => {
  return `
Fórmulas para Excel (pegar en las celdas correspondientes):

Suponiendo:
- Columna A: Código
- Columna B: Producto
- Columna C: Costo
- Columna D: Precio Venta
- Columna E: Markup (%)
- Columna F: Margen (%)
- Columna G: Ganancia

Fórmulas para fila 2:

E2 (Markup): =IF(AND(C2<>"",D2<>""), (D2-C2)/C2*100, "")
F2 (Margen): =IF(AND(C2<>"",D2<>""), (D2-C2)/D2*100, "")
G2 (Ganancia): =IF(AND(C2<>"",D2<>""), D2-C2, "")
`;
};

export default exportMarginToExcel;
