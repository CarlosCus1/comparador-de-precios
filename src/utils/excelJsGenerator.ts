/**
 * ExcelJSExcelGenerator - Generador de Excel con fórmulas reales
 * VERSIÓN DINÁMICA: Solo incluye columnas para marcas configuradas
 */

import * as ExcelJS from 'exceljs';

export interface ExcelProducto {
  codigo: string;
  nombre: string;
  cod_ean?: string;
  ean_14?: string;
  precios: Record<string, number | null>;
  precio_sugerido?: number;
  ranking?: number;
}

export interface ExcelData {
  productos: ExcelProducto[];
  marcas: string[];
  cliente: string;
  documento?: string;
  codigo_cliente?: string;
  sucursal?: string;
  responsable?: string;
  fecha?: string;
  selectedColumns?: string[];
}

/**
 * Convierte número de columna a letra de Excel (1=A, 2=B, ..., 27=AA, etc.)
 */
function colToLetter(col: number): string {
  let letter = '';
  while (col > 0) {
    const mod = (col - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

export async function generateExcelWithExcelJS(data: ExcelData): Promise<Blob> {
  console.log('🔄 Generando Excel con fórmulas (versión dinámica)...');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Comparador de Precios';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('COMPARATIVO_PRECIOS');

  // Formatos
  const currencyFormat = '#,##0.00';
  const percentageFormat = '0.00%';

  // === FILTRAR MARCAS VÁLIDAS ===
  const marcasValidas = data.marcas.filter(m => m && m.trim() !== '');
  const numMarcas = marcasValidas.length;
  const numCompetidores = Math.max(0, numMarcas - 1); // Excluye BASE
  
  console.log(`📊 Marcas detectadas: ${numMarcas} - [${marcasValidas.join(', ')}]`);
  console.log(`📊 Competidores: ${numCompetidores}`);

  if (numMarcas === 0) {
    throw new Error('No hay marcas configuradas para exportar');
  }

  // === DATOS GENERALES ===
  worksheet.getCell('A1').value = 'CLIENTE:';
  worksheet.getCell('A1').font = { bold: true };
  worksheet.getCell('B1').value = data.cliente;

  worksheet.getCell('A2').value = 'DOCUMENTO:';
  worksheet.getCell('A2').font = { bold: true };
  worksheet.getCell('B2').value = data.documento || '';

  worksheet.getCell('A3').value = 'FECHA:';
  worksheet.getCell('A3').font = { bold: true };
  worksheet.getCell('B3').value = data.fecha || new Date().toLocaleDateString('es-PE');

  worksheet.getCell('A4').value = 'RESPONSABLE:';
  worksheet.getCell('A4').font = { bold: true };
  worksheet.getCell('B4').value = data.responsable || '';

  // Marcas dinámicas
  let marcaRow = 6;
  marcasValidas.forEach((marca, index) => {
    worksheet.getCell(`A${marcaRow}`).value = `MARCA ${index + 1}:`;
    worksheet.getCell(`A${marcaRow}`).font = { bold: true };
    worksheet.getCell(`B${marcaRow}`).value = marca;
    marcaRow++;
  });

  // Estilos
  const headerFont = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFF' } };
  const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } };

  // Colores para competidores
  const brandColors: string[] = [
    'B8CCE4',  // Azul
    'C6E0B4',  // Verde
    'F8CBAD',  // Naranja
    'FFE699',  // Amarillo
  ];

  // === HEADERS DINÁMICOS ===
  const headers: string[] = [
    'CODIGO', 'EAN13', 'NOMBRE PRODUCTO',
    `${marcasValidas[0]} (BASE)`,
  ];

  // Agregar columnas solo para competidores existentes
  for (let i = 1; i < numMarcas; i++) {
    const marcaName = marcasValidas[i];
    headers.push(`${marcaName}_PRECIO`, `${marcaName}_DIF`, `${marcaName}_PCT`);
  }

  // Columnas de estadísticas
  headers.push(
    'PRECIO MIN', 'PRECIO MAX', 'PROMEDIO', 'DESV. ESTÁNDAR',
    'DISPERSIÓN (CV)', 'CONTEO', '+BARATOS / +CAROS', 'RANKING',
    'PRECIO SUGERIDO', 'RANKING SUGERIDO',
    '% VS PROMEDIO', '% VS MÍNIMO', '% VS MÁXIMO',
    'DIFERENCIA', 'IMPACTO %'
  );

  // Calcular posición inicial de la tabla
  const tableStartRow = marcaRow + 2; // Dejar una fila vacía después de marcas

  // Escribir headers
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(tableStartRow, index + 1);
    cell.value = header;
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
  });

  // === MAPEO DE COLUMNAS DINÁMICO ===
  // Columna 1: CODIGO
  // Columna 2: EAN13
  // Columna 3: NOMBRE
  // Columna 4: BASE
  // Columnas 5+: Competidores (3 columnas cada uno: PRECIO, DIF, PCT)
  
  const COL_CODIGO = 1;
  const COL_EAN = 2;
  const COL_NOMBRE = 3;
  const COL_BASE = 4;
  
  // Array con las columnas de precios de competidores
  const competidorPriceCols: number[] = [];
  for (let i = 0; i < numCompetidores; i++) {
    // Cada competidor ocupa 3 columnas: PRECIO, DIF, PCT
    // El primer competidor empieza en columna 5
    competidorPriceCols.push(5 + (i * 3));
  }

  // Calcular columnas de estadísticas (después del último competidor)
  const lastCompetitorCol = numCompetidores > 0 ? 5 + (numCompetidores * 3) - 1 : 4;
  const statsStartCol = lastCompetitorCol + 1;
  
  const COL_MIN = statsStartCol;
  const COL_MAX = statsStartCol + 1;
  const COL_PROMEDIO = statsStartCol + 2;
  const COL_STDEV = statsStartCol + 3;
  const COL_CV = statsStartCol + 4;
  const COL_CONTEO = statsStartCol + 5;
  const COL_CHEAP_EXP = statsStartCol + 6;
  const COL_RANKING = statsStartCol + 7;
  const COL_SUGERIDO = statsStartCol + 8;
  const COL_RANK_SUG = statsStartCol + 9;
  const COL_VS_PROM = statsStartCol + 10;
  const COL_VS_MIN = statsStartCol + 11;
  const COL_VS_MAX = statsStartCol + 12;
  const COL_DIFERENCIA = statsStartCol + 13;
  const COL_IMPACTO = statsStartCol + 14;

  console.log(`📊 Columnas: BASE=${COL_BASE}, Competidores=[${competidorPriceCols.join(',')}], Stats=${statsStartCol}-${COL_IMPACTO}`);

  // === FILAS DE DATOS ===
  let dataRow = tableStartRow + 1;

  for (const producto of data.productos) {
    const row = worksheet.getRow(dataRow);
    const preciosMap = producto.precios || {};
    const basePrice = preciosMap[marcasValidas[0]] || null;
    const rowNum = dataRow;

    // CODIGO, EAN13, NOMBRE
    row.getCell(COL_CODIGO).value = producto.codigo || '';
    row.getCell(COL_EAN).value = producto.cod_ean || '';
    row.getCell(COL_NOMBRE).value = producto.nombre || '';

    // BASE
    const baseCell = row.getCell(COL_BASE);
    baseCell.value = basePrice;
    baseCell.numFmt = currencyFormat;
    baseCell.alignment = { horizontal: 'right' };

    // COMPETIDORES
    for (let i = 0; i < numCompetidores; i++) {
      const marcaName = marcasValidas[i + 1];
      const price = preciosMap[marcaName] || null;
      const colorIndex = i % brandColors.length;
      const brandColor = brandColors[colorIndex];
      
      const priceCol = competidorPriceCols[i];
      const difCol = priceCol + 1;
      const pctCol = priceCol + 2;
      
      const priceColLetter = colToLetter(priceCol);
      const baseColLetter = colToLetter(COL_BASE);

      // Precio
      const priceCell = row.getCell(priceCol);
      priceCell.value = price;
      priceCell.numFmt = currencyFormat;
      priceCell.alignment = { horizontal: 'right' };
      priceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandColor } };

      // Diferencia (BASE - Competidor)
      const difCell = row.getCell(difCol);
      difCell.value = { formula: `=IFERROR(${baseColLetter}${rowNum}-${priceColLetter}${rowNum},"")` };
      difCell.numFmt = currencyFormat;
      difCell.alignment = { horizontal: 'right' };
      difCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandColor } };

      // Porcentaje ((BASE/Competidor) - 1)
      const pctCell = row.getCell(pctCol);
      pctCell.value = { formula: `=IFERROR(${baseColLetter}${rowNum}/${priceColLetter}${rowNum}-1,"")` };
      pctCell.numFmt = percentageFormat;
      pctCell.alignment = { horizontal: 'right' };
      pctCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandColor } };
    }

    // === ESTADÍSTICAS ===
    // Construir lista de columnas de precios para fórmulas
    const allPriceCols = [COL_BASE, ...competidorPriceCols];
    const competitorPriceCols = competidorPriceCols; // Solo competidores para promedio
    
    const allPriceColsLetters = allPriceCols.map(c => colToLetter(c));
    const competitorPriceColsLetters = competitorPriceCols.map(c => colToLetter(c));

    // MIN
    const minCell = row.getCell(COL_MIN);
    if (allPriceColsLetters.length > 0) {
      minCell.value = { formula: `=MIN(${allPriceColsLetters.map(l => `${l}${rowNum}`).join(',')})` };
    }
    minCell.numFmt = currencyFormat;
    minCell.alignment = { horizontal: 'right' };

    // MAX
    const maxCell = row.getCell(COL_MAX);
    if (allPriceColsLetters.length > 0) {
      maxCell.value = { formula: `=MAX(${allPriceColsLetters.map(l => `${l}${rowNum}`).join(',')})` };
    }
    maxCell.numFmt = currencyFormat;
    maxCell.alignment = { horizontal: 'right' };

    // PROMEDIO (solo competidores)
    const avgCell = row.getCell(COL_PROMEDIO);
    if (competitorPriceColsLetters.length > 0) {
      avgCell.value = { formula: `=AVERAGE(${competitorPriceColsLetters.map(l => `${l}${rowNum}`).join(',')})` };
    }
    avgCell.numFmt = currencyFormat;
    avgCell.alignment = { horizontal: 'right' };

    // DESV. ESTÁNDAR (solo competidores)
    const stdevCell = row.getCell(COL_STDEV);
    if (competitorPriceColsLetters.length > 1) {
      stdevCell.value = { formula: `=STDEV(${competitorPriceColsLetters.map(l => `${l}${rowNum}`).join(',')})` };
    }
    stdevCell.numFmt = currencyFormat;
    stdevCell.alignment = { horizontal: 'right' };

    // CV
    const cvCell = row.getCell(COL_CV);
    const stdevColLetter = colToLetter(COL_STDEV);
    const promColLetter = colToLetter(COL_PROMEDIO);
    cvCell.value = { formula: `=IFERROR(${stdevColLetter}${rowNum}/${promColLetter}${rowNum},"")` };
    cvCell.numFmt = percentageFormat;
    cvCell.alignment = { horizontal: 'right' };

    // CONTEO (solo competidores)
    const conteoCell = row.getCell(COL_CONTEO);
    if (competitorPriceColsLetters.length > 0) {
      conteoCell.value = { formula: `=COUNT(${competitorPriceColsLetters.map(l => `${l}${rowNum}`).join(',')})` };
    }
    conteoCell.alignment = { horizontal: 'right' };

    // +BARATOS / +CAROS
    const baseColLetter = colToLetter(COL_BASE);
    const cheapExpCell = row.getCell(COL_CHEAP_EXP);
    if (competitorPriceColsLetters.length > 0) {
      // Usar N() para convertir booleanos a números (TRUE=1, FALSE=0)
      const comparisons = competitorPriceColsLetters.map(l => 
        `N(${baseColLetter}${rowNum}>${l}${rowNum})`
      ).join('+');
      const comparisonsInverse = competitorPriceColsLetters.map(l => 
        `N(${baseColLetter}${rowNum}<${l}${rowNum})`
      ).join('+');
      cheapExpCell.value = { formula: `=CONCATENATE(${comparisons}," / ",${comparisonsInverse})` };
    }
    cheapExpCell.alignment = { horizontal: 'right' };

    // RANKING
    const rankCell = row.getCell(COL_RANKING);
    if (competitorPriceColsLetters.length > 0) {
      const comparisons = competitorPriceColsLetters.map(l => 
        `(${baseColLetter}${rowNum}>${l}${rowNum})`
      ).join('+');
      rankCell.value = { formula: `=1+${comparisons}` };
    }
    rankCell.alignment = { horizontal: 'right' };

    // PRECIO SUGERIDO
    const sugCell = row.getCell(COL_SUGERIDO);
    sugCell.value = producto.precio_sugerido || null;
    sugCell.numFmt = currencyFormat;
    sugCell.alignment = { horizontal: 'right' };
    sugCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } };
    sugCell.font = { italic: true, bold: true };

    // RANKING SUGERIDO
    const sugColLetter = colToLetter(COL_SUGERIDO);
    const rankSugCell = row.getCell(COL_RANK_SUG);
    if (competitorPriceColsLetters.length > 0) {
      const allComparisons = [baseColLetter, ...competitorPriceColsLetters].map(l => 
        `(${sugColLetter}${rowNum}>${l}${rowNum})`
      ).join('+');
      rankSugCell.value = { formula: `=IF(${sugColLetter}${rowNum}<>"",1+${allComparisons},"")` };
    }
    rankSugCell.alignment = { horizontal: 'right' };

    // % VS PROMEDIO
    const vsPromCell = row.getCell(COL_VS_PROM);
    vsPromCell.value = { formula: `=IF(AND(${baseColLetter}${rowNum}<>"",${promColLetter}${rowNum}<>""),IF(ROUND(${baseColLetter}${rowNum}/${promColLetter}${rowNum}-1,4)=0,"=",${baseColLetter}${rowNum}/${promColLetter}${rowNum}-1),"")` };
    vsPromCell.numFmt = percentageFormat;
    vsPromCell.alignment = { horizontal: 'right' };

    // % VS MÍNIMO
    const minColLetter = colToLetter(COL_MIN);
    const vsMinCell = row.getCell(COL_VS_MIN);
    vsMinCell.value = { formula: `=IF(AND(${baseColLetter}${rowNum}<>"",${minColLetter}${rowNum}<>""),${baseColLetter}${rowNum}/${minColLetter}${rowNum}-1,"")` };
    vsMinCell.numFmt = percentageFormat;
    vsMinCell.alignment = { horizontal: 'right' };

    // % VS MÁXIMO
    const maxColLetter = colToLetter(COL_MAX);
    const vsMaxCell = row.getCell(COL_VS_MAX);
    vsMaxCell.value = { formula: `=IF(AND(${baseColLetter}${rowNum}<>"",${maxColLetter}${rowNum}<>""),${baseColLetter}${rowNum}/${maxColLetter}${rowNum}-1,"")` };
    vsMaxCell.numFmt = percentageFormat;
    vsMaxCell.alignment = { horizontal: 'right' };

    // DIFERENCIA
    const diffCell = row.getCell(COL_DIFERENCIA);
    diffCell.value = { formula: `=IF(AND(${baseColLetter}${rowNum}<>"",${sugColLetter}${rowNum}<>""),${baseColLetter}${rowNum}-${sugColLetter}${rowNum},"")` };
    diffCell.numFmt = currencyFormat;
    diffCell.alignment = { horizontal: 'right' };
    diffCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE699' } };
    diffCell.font = { bold: true };

    // IMPACTO %
    const impactCell = row.getCell(COL_IMPACTO);
    impactCell.value = { formula: `=IF(AND(${baseColLetter}${rowNum}<>"",${sugColLetter}${rowNum}<>""),${baseColLetter}${rowNum}/${sugColLetter}${rowNum}-1,"")` };
    impactCell.numFmt = percentageFormat;
    impactCell.alignment = { horizontal: 'right' };
    impactCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE699' } };
    impactCell.font = { bold: true };

    dataRow++;
  }

  // Autofiltro
  worksheet.autoFilter = {
    from: `A${tableStartRow}`,
    to: `${colToLetter(headers.length)}${dataRow - 1}`
  };

  // Ancho columnas
  worksheet.columns.forEach(column => {
    column.width = 14;
  });

  // === NOTAS INFORMATIVAS ===
  const noteRow = dataRow + 2;
  worksheet.getCell(noteRow, 1).value = '📊 FÓRMULAS Y CÁLCULOS:';
  worksheet.getCell(noteRow, 1).font = { bold: true, size: 11 };
  
  const formulas = [
    `• Marcas incluidas: ${marcasValidas.join(', ')}`,
    `• Competidores analizados: ${numCompetidores}`,
    '',
    '• DIFERENCIA = Tu Precio - Precio Competidor → Valor positivo = más caro que competidor',
    '• PORCENTAJE = (Tu Precio / Precio Competidor) - 1 → % de diferencia vs competidor',
    '• PRECIO MIN/MAX = Menor/Mayor precio entre todos los competidores',
    '• PROMEDIO = Media aritmética de precios de competidores (sin BASE)',
    '• DESV. ESTÁNDAR = Medida de dispersión de precios entre competidores',
    '• DISPERSIÓN (CV) = Coeficiente de variación = Desv/Promedio → mayor = más variable',
    '• RANKING = Posición de tu precio (1 = más barato)',
    '',
    '• PRECIO SUGERIDO = Precio recomendado (puede provenir de estrategia)',
    '• RANKING SUGERIDO = Posición que tendrías con el precio sugerido',
    '• % VS PROMEDIO = Tu precio vs promedio de mercado',
    '• DIFERENCIA = Tu precio - Precio sugerido',
    '• IMPACTO % = Cambio porcentual si usas el precio sugerido',
    '',
    '💡 NOTA: Los valores negativos en DIFERENCIA significan que eres más barato que el competidor.',
    '💡 El RANKING 1 es el precio más bajo del mercado.'
  ];
  
  formulas.forEach((text, index) => {
    worksheet.getCell(noteRow + 1 + index, 1).value = text;
    worksheet.getCell(noteRow + 1 + index, 1).font = { size: 10, color: { argb: '666666' } };
  });

  // Hoja KPIs
  const kpiSheet = workbook.addWorksheet('KPIs');
  kpiSheet.getCell('A1').value = 'KPI';
  kpiSheet.getCell('A1').font = { bold: true };
  kpiSheet.getCell('B1').value = 'Valor';
  kpiSheet.getCell('B1').font = { bold: true };
  kpiSheet.getCell('A2').value = 'Total Productos';
  kpiSheet.getCell('B2').value = data.productos.length;
  kpiSheet.getCell('A3').value = 'Marcas Configuradas';
  kpiSheet.getCell('B3').value = numMarcas;
  kpiSheet.getCell('A4').value = 'Competidores';
  kpiSheet.getCell('B4').value = numCompetidores;
  kpiSheet.getCell('A5').value = 'Fecha';
  kpiSheet.getCell('B5').value = new Date().toLocaleString('es-PE');
  kpiSheet.getColumn('A').width = 25;
  kpiSheet.getColumn('B').width = 15;

  const buffer = await workbook.xlsx.writeBuffer();
  console.log('✅ Excel generado con fórmulas (versión dinámica)');

  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}

export default generateExcelWithExcelJS;
