/**
 * pyExcelGenerator - Generador de Excel usando Pyodide (Python en el navegador)
 * 
 * Este módulo permite generar archivos Excel con fórmulas activas usando
 * Python y openpyxl ejecutándose en el navegador via WebAssembly.
 * 
 * Esto elimina la necesidad del backend para generación de Excel,
 * permitiendo una aplicación 100% estática.
 * 
 * Uso:
 *   import { generateExcelWithPyodide } from './pyExcelGenerator';
 *   
 *   const blob = await generateExcelWithPyodide(pyodide, data);
 *   // Descargar el blob como archivo .xlsx
 */

// Interfaz para Pyodide - definida aquí para evitar problemas de importación
interface PyodideInterface {
  runPython: (code: string) => unknown;
  loadPackage: (packages: string[] | string) => Promise<void>;
  FS?: {
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string) => Uint8Array;
  };
  globals?: {
    get: (name: string) => unknown;
  };
}

// Tipos para los datos de exportación
export interface ExcelProducto {
  codigo: string;
  nombre: string;
  cod_ean?: string;
  ean_14?: string;
  precios: Record<string, number | null>;
  precio_promedio?: number;
  precio_sugerido?: number;
  precio_min?: number;
  precio_max?: number;
  desviacion_estandar?: number;
  coeficiente_variacion?: number;
  vs_promedio?: number;
  vs_minimo?: number;
  vs_maximo?: number;
  conteo_competidores?: number;
  cheaper_expensive_count?: string;
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

interface PyExcelGeneratorOptions {
  includeFormulas?: boolean;
  includeStyles?: boolean;
  includeKpis?: boolean;
}

/**
 * Genera un archivo Excel usando Pyodide
 * 
 * @param pyodide - Instancia de Pyodide cargada
 * @param data - Datos para el Excel
 * @param _options - Opciones adicionales (reservado para uso futuro)
 * @returns Blob del archivo Excel
 */
export async function generateExcelWithPyodide(
  pyodide: PyodideInterface,
  data: ExcelData,
  _options?: PyExcelGeneratorOptions
): Promise<Blob> {
  // Convertir datos a formato JSON para Python
  const productosJson = JSON.stringify(data.productos);
  const marcasJson = JSON.stringify(data.marcas);
  const formDataJson = JSON.stringify({
    cliente: data.cliente,
    documento: data.documento,
    codigo_cliente: data.codigo_cliente,
    sucursal: data.sucursal || 'principal',
    responsable: data.responsable || '',
    fecha: data.fecha || new Date().toISOString(),
    selectedColumns: data.selectedColumns || [],
  });

  // Evitar warning de parámetro no usado
  void _options;

  // Código Python que genera el Excel
  // Este código se pasa como string a Pyodide
  const pythonCode = [
    'import json',
    'import io',
    'import base64',
    'from datetime import datetime',
    'from openpyxl import Workbook',
    'from openpyxl.styles import Font, PatternFill, Alignment, Border, Side',
    'from openpyxl.utils import get_column_letter',
    'from openpyxl.comments import Comment',
    '',
    '# Cargar datos desde JavaScript',
    `productos = json.loads('''${productosJson}''')`,
    `marcas = json.loads('''${marcasJson}''')`,
    `form_data = json.loads('''${formDataJson}''')`,
    '',
    '# Configuración',
    "CLIENTE = form_data.get('cliente', 'Cliente')",
    "DOCUMENTO = form_data.get('documento', '')",
    "SUCURSAL = form_data.get('sucursal', 'principal')",
    "RESPONSABLE = form_data.get('responsable', '')",
    "FECHA = form_data.get('fecha', datetime.now().isoformat())",
    '',
    '# Todos los IDs de columnas posibles',
    "ALL_COLUMN_IDS = ['codigo', 'ean13', 'ean14', 'nombre', 'm1_precio', 'm2_precio', 'm2_dif', 'm2_pct', 'm2_ratio', 'm3_precio', 'm3_dif', 'm3_pct', 'm3_ratio', 'm4_precio', 'm4_dif', 'm4_pct', 'm4_ratio', 'm5_precio', 'm5_dif', 'm5_pct', 'm5_ratio', 'min_max', 'avg_stdev', 'dispersion', 'sugerido_precio', 'sugerido_ranking', 'vs_prom', 'vs_min', 'vs_max', 'count_competitors', 'count_cheaper_expensive', 'ranking']",
    '',
    '# Columnas seleccionadas',
    "selected_columns = form_data.get('selectedColumns', [])",
    'if selected_columns:',
    '    columns_to_include = [col for col in ALL_COLUMN_IDS if col in selected_columns]',
    'else:',
    '    columns_to_include = ALL_COLUMN_IDS',
    '',
    '# Mapeo de columnas',
    "COLUMN_MAPPING = {",
    "    'codigo': ['CODIGO'], 'ean13': ['EAN13'], 'ean14': ['EAN14'], 'nombre': ['NOMBRE PRODUCTO'],",
    "    'm1_precio': ['BASE (M1)'],",
    "    'm2_precio': ['M2_PRECIO'], 'm2_dif': ['M2_DIF'], 'm2_pct': ['M2_PCT'], 'm2_ratio': ['M2_RATIO'],",
    "    'm3_precio': ['M3_PRECIO'], 'm3_dif': ['M3_DIF'], 'm3_pct': ['M3_PCT'], 'm3_ratio': ['M3_RATIO'],",
    "    'm4_precio': ['M4_PRECIO'], 'm4_dif': ['M4_DIF'], 'm4_pct': ['M4_PCT'], 'm4_ratio': ['M4_RATIO'],",
    "    'm5_precio': ['M5_PRECIO'], 'm5_dif': ['M5_DIF'], 'm5_pct': ['M5_PCT'], 'm5_ratio': ['M5_RATIO'],",
    "    'min_max': ['PRECIO MIN', 'PRECIO MAX'],",
    "    'avg_stdev': ['PROMEDIO', 'DESV. ESTÁNDAR'],",
    "    'dispersion': ['DISPERSIÓN (CV)'],",
    "    'sugerido_precio': ['PRECIO SUGERIDO'],",
    "    'sugerido_ranking': ['RANKING SUGERIDO'],",
    "    'vs_prom': ['% VS PROMEDIO'],",
    "    'vs_min': ['% VS MÍNIMO'],",
    "    'vs_max': ['% VS MÁXIMO'],",
    "    'count_competitors': ['CONTEO COMPETIDORES'],",
    "    'count_cheaper_expensive': ['+BARATOS / +CAROS'],",
    "    'ranking': ['RANKING']",
    '}',
    '',
    '# Estilos',
    "header_font = Font(name='Arial', bold=True, size=11, color='FFFFFF')",
    "header_fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')",
    'thin_border = Border(left=Side(style=\'thin\'), right=Side(style=\'thin\'), top=Side(style=\'thin\'), bottom=Side(style=\'thin\'))',
    'right_alignment = Alignment(horizontal=\'right\', vertical=\'center\')',
    'center_alignment = Alignment(horizontal=\'center\', vertical=\'center\')',
    '',
    '# Colores por marca',
    "brand_fills = {",
    "    'M2': PatternFill(start_color='BDE0FE', end_color='BDE0FE', fill_type='solid'),",
    "    'M3': PatternFill(start_color='C6EFCE', end_color='C6EFCE', fill_type='solid'),",
    "    'M4': PatternFill(start_color='FFDDC1', end_color='FFDDC1', fill_type='solid'),",
    "    'M5': PatternFill(start_color='FFFACD', end_color='FFFACD', fill_type='solid'),",
    '}',
    "sugerido_fill = PatternFill(start_color='E0E0E0', end_color='E0E0E0', fill_type='solid')",
    "sugerido_font = Font(name='Arial', italic=True, bold=True)",
    '',
    '# Crear workbook',
    'wb = Workbook()',
    "if 'Sheet' in wb.sheetnames:",
    '    wb.remove(wb[\'Sheet\'])',
    '',
    "ws = wb.create_sheet(title='COMPARATIVO_PRECIOS', index=0)",
    '',
    '# === BLOQUE DE DATOS GENERALES ===',
    "ws.cell(row=1, column=1, value='CLIENTE:').font = Font(bold=True)",
    'ws.cell(row=1, column=2, value=CLIENTE)',
    "ws.cell(row=2, column=1, value='DOCUMENTO:').font = Font(bold=True)",
    'ws.cell(row=2, column=2, value=DOCUMENTO)',
    "ws.cell(row=3, column=1, value='FECHA:').font = Font(bold=True)",
    'ws.cell(row=3, column=2, value=FECHA[:10] if FECHA else \'\')',
    "ws.cell(row=4, column=1, value='RESPONSABLE:').font = Font(bold=True)",
    'ws.cell(row=4, column=2, value=RESPONSABLE)',
    '',
    '# Espacio',
    'table_start_row = 6',
    '',
    '# === ENCABEZADOS DE TABLA ===',
    'headers = []',
    'for col_id in ALL_COLUMN_IDS:',
    '    if col_id in columns_to_include:',
    '        headers.extend(COLUMN_MAPPING.get(col_id, [col_id]))',
    '',
    'for col_num, header in enumerate(headers, 1):',
    '    cell = ws.cell(row=table_start_row, column=col_num, value=header)',
    '    cell.font = header_font',
    '    cell.fill = header_fill',
    '    cell.border = thin_border',
    '    cell.alignment = center_alignment',
    '',
    '# === DATOS DE PRODUCTOS ===',
    'current_row = table_start_row + 1',
    'currency_format = \'"S/" #,##0.00\'',
    'percentage_format = \'0.00%\'',
    '',
    'for producto in productos:',
    '    precios_map = producto.get(\'precios\', {})',
    '    base_price = precios_map.get(marcas[0]) if precios_map.get(marcas[0]) else None',
    '    base_cell_coord = None',
    '    col_num = 1',
    '',
    '    # CODIGO',
    '    if \'codigo\' in columns_to_include:',
    '        ws.cell(row=current_row, column=col_num, value=producto.get(\'codigo\', \'\'))',
    '        col_num += 1',
    '',
    '    # EAN13',
    '    if \'ean13\' in columns_to_include:',
    '        ws.cell(row=current_row, column=col_num, value=producto.get(\'cod_ean\', \'\'))',
    '        col_num += 1',
    '',
    '    # EAN14',
    '    if \'ean14\' in columns_to_include:',
    '        ws.cell(row=current_row, column=col_num, value=producto.get(\'ean_14\', \'\'))',
    '        col_num += 1',
    '',
    '    # NOMBRE',
    '    if \'nombre\' in columns_to_include:',
    '        ws.cell(row=current_row, column=col_num, value=producto.get(\'nombre\', \'\'))',
    '        col_num += 1',
    '',
    '    # PRECIO BASE (M1)',
    '    if \'m1_precio\' in columns_to_include:',
    '        base_cell = ws.cell(row=current_row, column=col_num, value=base_price)',
    '        base_cell.number_format = currency_format',
    '        base_cell.alignment = right_alignment',
    '        base_cell_coord = base_cell.coordinate',
    '        if base_price:',
    '            base_cell.comment = Comment(\'Precio base editable - modificar para actualizar análisis\', \'System\')',
    '        col_num += 1',
    '',
    '    # Precios de competidores (M2-M5)',
    '    for i in range(1, 5):',
    '        marca_name = marcas[i] if i < len(marcas) else f\'Marca{i+1}\'',
    '        price = precios_map.get(marca_name)',
    '        marca_key = f\'M{i+2}\'',
    '',
    '        # Precio competidor',
    '        if f\'m{i+1}_precio\' in columns_to_include:',
    '            price_cell = ws.cell(row=current_row, column=col_num, value=price)',
    '            price_cell.number_format = currency_format',
    '            price_cell.alignment = right_alignment',
    '            price_cell.fill = brand_fills.get(marca_key, PatternFill())',
    '            if price:',
    '                price_cell.comment = Comment(f\'Precio {marca_name} editable - modificar para actualizar análisis\', \'System\')',
    '            col_num += 1',
    '',
    '        # Diferencia (fórmula)',
    '        if f\'m{i+1}_dif\' in columns_to_include and base_cell_coord:',
    '            dif_cell = ws.cell(row=current_row, column=col_num)',
    '            dif_cell.value = f\'=SI({price_cell.coordinate}<>""; {price_cell.coordinate}-{base_cell_coord}; "")\'',
    '            dif_cell.number_format = currency_format',
    '            dif_cell.alignment = right_alignment',
    '            dif_cell.fill = brand_fills.get(marca_key, PatternFill())',
    '            col_num += 1',
    '',
    '        # Porcentaje (fórmula)',
    '        if f\'m{i+1}_pct\' in columns_to_include and base_cell_coord:',
    '            pct_cell = ws.cell(row=current_row, column=col_num)',
    '            pct_cell.value = f\'=SI(Y({price_cell.coordinate}<>""; {price_cell.coordinate}<>0); ({base_cell_coord}/{price_cell.coordinate})-1; "")\'',
    '            pct_cell.number_format = percentage_format',
    '            pct_cell.alignment = right_alignment',
    '            pct_cell.fill = brand_fills.get(marca_key, PatternFill())',
    '            col_num += 1',
    '',
    '        # Ratio (fórmula)',
    '        if f\'m{i+1}_ratio\' in columns_to_include and base_cell_coord:',
    '            ratio_cell = ws.cell(row=current_row, column=col_num)',
    '            ratio_cell.value = f\'=SI(Y({price_cell.coordinate}<>""; {price_cell.coordinate}<>0); ({base_cell_coord}/{price_cell.coordinate})-1; "")\'',
    '            ratio_cell.number_format = percentage_format',
    '            ratio_cell.alignment = right_alignment',
    '            ratio_cell.fill = brand_fills.get(marca_key, PatternFill())',
    '            col_num += 1',
    '',
    '    # Calcular estadísticas',
    '    precios_list = [precios_map.get(marcas[j]) for j in range(5) if precios_map.get(marcas[j]) is not None]',
    '    competidores = precios_list[1:] if len(precios_list) > 1 else []',
    '',
    '    # MIN / MAX',
    '    if \'min_max\' in columns_to_include:',
    '        min_val = min(precios_list) if precios_list else None',
    '        max_val = max(precios_list) if precios_list else None',
    '        min_cell = ws.cell(row=current_row, column=col_num, value=min_val)',
    '        min_cell.number_format = currency_format',
    '        min_cell.alignment = right_alignment',
    '        col_num += 1',
    '        max_cell = ws.cell(row=current_row, column=col_num, value=max_val)',
    '        max_cell.number_format = currency_format',
    '        max_cell.alignment = right_alignment',
    '        col_num += 1',
    '',
    '    # PROMEDIO / DESV. ESTÁNDAR',
    '    if \'avg_stdev\' in columns_to_include:',
    '        if precios_list:',
    '            avg = sum(precios_list) / len(precios_list)',
    '            stdev = (sum((x - avg)**2 for x in precios_list) / len(precios_list))**0.5',
    '        else:',
    '            avg = stdev = None',
    '        avg_cell = ws.cell(row=current_row, column=col_num, value=avg)',
    '        avg_cell.number_format = currency_format',
    '        avg_cell.alignment = right_alignment',
    '        col_num += 1',
    '        stdev_cell = ws.cell(row=current_row, column=col_num, value=stdev)',
    '        stdev_cell.number_format = currency_format',
    '        stdev_cell.alignment = right_alignment',
    '        col_num += 1',
    '',
    '    # DISPERSIÓN (CV)',
    '    if \'dispersion\' in columns_to_include:',
    '        if precios_list and avg and avg != 0:',
    '            disp = stdev / avg',
    '        else:',
    '            disp = None',
    '        disp_cell = ws.cell(row=current_row, column=col_num, value=disp)',
    '        disp_cell.number_format = percentage_format',
    '        disp_cell.alignment = right_alignment',
    '        col_num += 1',
    '',
    '    # PRECIO SUGERIDO',
    '    if \'sugerido_precio\' in columns_to_include:',
    '        sug_val = producto.get(\'precio_sugerido\', \'\')',
    '        sug_cell = ws.cell(row=current_row, column=col_num, value=sug_val)',
    '        sug_cell.number_format = currency_format',
    '        sug_cell.alignment = right_alignment',
    '        sug_cell.fill = sugerido_fill',
    '        sug_cell.font = sugerido_font',
    '        sug_cell.comment = Comment(\'Precio sugerido editable - modificar para actualizar análisis\', \'System\')',
    '        col_num += 1',
    '',
    '    # RANKING SUGERIDO',
    '    if \'sugerido_ranking\' in columns_to_include:',
    '        ws.cell(row=current_row, column=col_num, value=producto.get(\'ranking_sugerido\', \'\'))',
    '        col_num += 1',
    '',
    '    # % VS PROMEDIO',
    '    if \'vs_prom\' in columns_to_include:',
    '        vs_prom_val = producto.get(\'vs_promedio\')',
    '        vs_prom_cell = ws.cell(row=current_row, column=col_num, value=vs_prom_val)',
    '        vs_prom_cell.number_format = percentage_format',
    '        vs_prom_cell.alignment = right_alignment',
    '        col_num += 1',
    '',
    '    # % VS MÍNIMO',
    '    if \'vs_min\' in columns_to_include:',
    '        vs_min_val = producto.get(\'vs_minimo\')',
    '        vs_min_cell = ws.cell(row=current_row, column=col_num, value=vs_min_val)',
    '        vs_min_cell.number_format = percentage_format',
    '        vs_min_cell.alignment = right_alignment',
    '        col_num += 1',
    '',
    '    # % VS MÁXIMO',
    '    if \'vs_max\' in columns_to_include:',
    '        vs_max_val = producto.get(\'vs_maximo\')',
    '        vs_max_cell = ws.cell(row=current_row, column=col_num, value=vs_max_val)',
    '        vs_max_cell.number_format = percentage_format',
    '        vs_max_cell.alignment = right_alignment',
    '        col_num += 1',
    '',
    '    # CONTEO COMPETIDORES',
    '    if \'count_competitors\' in columns_to_include:',
    '        count_cell = ws.cell(row=current_row, column=col_num, value=len(competidores))',
    '        count_cell.alignment = right_alignment',
    '        col_num += 1',
    '',
    '    # +BARATOS / +CAROS',
    '    if \'count_cheaper_expensive\' in columns_to_include:',
    '        cheaper = sum(1 for p in competidores if p < base_price) if base_price else 0',
    '        expensive = sum(1 for p in competidores if p > base_price) if base_price else 0',
    '        ws.cell(row=current_row, column=col_num, value=f\'{cheaper} / {expensive}\')',
    '        col_num += 1',
    '',
    '    # RANKING',
    '    if \'ranking\' in columns_to_include:',
    '        rank_val = producto.get(\'ranking\')',
    '        rank_cell = ws.cell(row=current_row, column=col_num, value=rank_val)',
    '        rank_cell.alignment = right_alignment',
    '',
    '    current_row += 1',
    '',
    '# Aplicar autofiltro',
    'if headers:',
    '    last_col = get_column_letter(len(headers))',
    '    ws.auto_filter.ref = f\'A{table_start_row}:{last_col}{current_row - 1}\'',
    '',
    '# Autoajustar columnas',
    'for col in range(1, len(headers) + 1):',
    '    ws.column_dimensions[get_column_letter(col)].width = 15',
    '',
    '# === HOJA DE KPIs ===',
    'kpi_sheet = wb.create_sheet(title=\'KPIs\')',
    'kpi_sheet.cell(row=1, column=1, value=\'KPI\').font = Font(bold=True)',
    'kpi_sheet.cell(row=1, column=2, value=\'Valor\').font = Font(bold=True)',
    '',
    'row = 2',
    'kpi_sheet.cell(row=row, column=1, value=\'Total Productos Analizados\')',
    'kpi_sheet.cell(row=row, column=2, value=len(productos))',
    'row += 1',
    '',
    'kpi_sheet.cell(row=row, column=1, value=\'Fecha de Generación\')',
    'kpi_sheet.cell(row=row, column=2, value=datetime.now().strftime(\'%d/%m/%Y %H:%M\'))',
    '',
    'kpi_sheet.column_dimensions[\'A\'].width = 30',
    'kpi_sheet.column_dimensions[\'B\'].width = 20',
    '',
    '# Guardar a bytes',
    'buffer = io.BytesIO()',
    'wb.save(buffer)',
    'buffer.seek(0)',
    '',
    '# Convertir a base64 para JavaScript',
    'base64.b64encode(buffer.getvalue()).decode(\'utf-8\')',
  ].join('\n');

  try {
    // Ejecutar código Python
    console.log('🔄 Ejecutando generación de Excel con Python...');
    const base64Excel = await pyodide.runPython(pythonCode) as string;
    
    // Convertir base64 a Blob
    const binaryString = atob(base64Excel);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('✅ Excel generado correctamente con Pyodide');
    
    return new Blob([bytes], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  } catch (error) {
    console.error('❌ Error generando Excel con Pyodide:', error);
    throw error;
  }
}

/**
 * Descarga un Blob como archivo
 */
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

export default generateExcelWithPyodide;
