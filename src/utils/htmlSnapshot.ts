/**
 * Generador de HTML Navegable (Snapshot)
 * Crea un archivo HTML autocontenido que se puede abrir en el navegador
 * sin necesidad de servidor ni conexión a internet.
 */

interface HTMLSnapshotOptions {
  /** Título del documento */
  title: string;
  /** Nombre del cliente para el nombre del archivo */
  cliente?: string;
  /** Fecha del reporte */
  fecha?: string;
  /** Incluir estilos de impresión */
  includePrintStyles?: boolean;
  /** Incluir scripts de interactividad básica */
  includeInteractivity?: boolean;
}

/**
 * Extrae todos los estilos CSS del documento actual
 */
function extractAllStyles(): string {
  const styles: string[] = [];
  
  // Obtener todas las hojas de estilo
  const styleSheets = document.styleSheets;
  
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const sheet = styleSheets[i];
      const rules = sheet.cssRules || sheet.rules;
      
      for (let j = 0; j < rules.length; j++) {
        styles.push(rules[j].cssText);
      }
    } catch (e) {
      // Algunas hojas de estilo pueden estar bloqueadas por CORS
      console.warn('No se pudo acceder a una hoja de estilo:', e);
    }
  }
  
  return styles.join('\n');
}

/**
 * Extrae estilos computados de un elemento y sus hijos
 */
function extractComputedStyles(element: HTMLElement): string {
  const elements = [element, ...element.querySelectorAll('*')] as HTMLElement[];
  const styles: string[] = [];
  
  elements.forEach((el, index) => {
    const computed = window.getComputedStyle(el);
    const styleArray: string[] = [];
    
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      const value = computed.getPropertyValue(prop);
      styleArray.push(`${prop}: ${value}`);
    }
    
    if (styleArray.length > 0) {
      styles.push(`.computed-style-${index} { ${styleArray.join('; ')}; }`);
      el.classList.add(`computed-style-${index}`);
    }
  });
  
  return styles.join('\n');
}

/**
 * Obtiene las variables CSS del documento
 */
function extractCSSVariables(): string {
  const root = document.documentElement;
  const computed = window.getComputedStyle(root);
  const variables: string[] = [];
  
  // Variables CSS comunes
  const cssVars = [
    '--color-primary', '--color-secondary', '--color-accent',
    '--color-success', '--color-warning', '--color-danger',
    '--color-bg-primary', '--color-bg-secondary', '--color-bg-tertiary',
    '--text-primary', '--text-secondary', '--text-tertiary',
    '--border-primary', '--border-secondary',
    '--color-comparador-primary', '--color-comparador-secondary',
    '--surface-elevated', '--bg-tertiary'
  ];
  
  cssVars.forEach(varName => {
    const value = computed.getPropertyValue(varName);
    if (value) {
      variables.push(`${varName}: ${value};`);
    }
  });
  
  return `:root { ${variables.join(' ')} }`;
}

/**
 * Genera estilos de impresión para el documento
 */
function getPrintStyles(): string {
  return `
@media print {
  body {
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .no-print {
    display: none !important;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .glass-card {
    box-shadow: none !important;
    border: 1px solid #e2e8f0 !important;
  }
  
  @page {
    margin: 1cm;
    size: A4 portrait;
  }
}
`;
}

/**
 * Genera scripts de interactividad básica
 */
function getInteractivityScripts(): string {
  return `
<script>
// Toggle de tema claro/oscuro
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// Cargar tema guardado
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

// Imprimir documento
function printDocument() {
  window.print();
}

// Mostrar/ocultar secciones
function toggleSection(id) {
  const section = document.getElementById(id);
  if (section) {
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  }
}
</script>
`;
}

/**
 * Crea el documento HTML completo
 */
function createHTMLDocument(
  content: string,
  options: HTMLSnapshotOptions
): string {
  const { title, includePrintStyles = true, includeInteractivity = true } = options;
  
  // Detectar tema actual
  const isDark = document.documentElement.classList.contains('dark');
  const bodyClass = isDark ? 'dark' : '';
  
  return `<!DOCTYPE html>
<html lang="es" class="${bodyClass}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Reporte generado desde Comparador de Precios">
  <title>${title}</title>
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E📊%3C/text%3E%3C/svg%3E">
  
  <style>
    /* Reset básico */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Variables CSS */
    ${extractCSSVariables()}
    
    /* Estilos del documento original */
    ${extractAllStyles()}
    
    ${includePrintStyles ? getPrintStyles() : ''}
    
    /* Estilos adicionales para el snapshot */
    .snapshot-header {
      position: sticky;
      top: 0;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .snapshot-header h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .snapshot-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .snapshot-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    
    .snapshot-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .snapshot-content {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .snapshot-footer {
      text-align: center;
      padding: 1rem;
      color: #64748b;
      font-size: 0.75rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 2rem;
    }
    
    /* Dark mode para snapshot */
    .dark .snapshot-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    }
    
    .dark .snapshot-footer {
      border-top-color: #334155;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <!-- Header del snapshot -->
  <header class="snapshot-header no-print">
    <h1>📊 ${title}</h1>
    <div class="snapshot-actions">
      <button class="snapshot-btn" onclick="toggleTheme()" title="Cambiar tema">
        🌓 Tema
      </button>
      <button class="snapshot-btn" onclick="printDocument()" title="Imprimir documento">
        🖨️ Imprimir
      </button>
    </div>
  </header>
  
  <!-- Contenido principal -->
  <main class="snapshot-content">
    ${content}
  </main>
  
  <!-- Footer del snapshot -->
  <footer class="snapshot-footer">
    <p>Generado el ${new Date().toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} | Comparador de Precios</p>
  </footer>
  
  ${includeInteractivity ? getInteractivityScripts() : ''}
</body>
</html>`;
}

/**
 * Descarga un archivo HTML
 */
function downloadHTML(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar memoria
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Función principal: Genera y descarga un snapshot HTML del elemento
 */
export async function generateHTMLSnapshot(
  element: HTMLElement,
  options: HTMLSnapshotOptions
): Promise<void> {
  console.log('🚀 Generando snapshot HTML...');
  
  const { title, cliente, fecha } = options;
  
  // Clonar el elemento para no modificar el original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Remover elementos no deseados (botones de acción, inputs, etc.)
  const elementsToRemove = clone.querySelectorAll('.no-export, button, input, select, textarea, [data-no-export]');
  elementsToRemove.forEach(el => el.remove());
  
  // Convertir canvas a imágenes (para gráficos)
  const canvases = clone.querySelectorAll('canvas');
  for (const canvas of canvases) {
    try {
      const img = document.createElement('img');
      img.src = (canvas as HTMLCanvasElement).toDataURL('image/png');
      img.style.width = canvas.style.width || '100%';
      img.style.height = canvas.style.height || 'auto';
      canvas.replaceWith(img);
    } catch (e) {
      console.warn('No se pudo convertir un canvas a imagen:', e);
    }
  }
  
  // Generar el documento HTML
  const htmlContent = createHTMLDocument(clone.innerHTML, options);
  
  // Generar nombre del archivo
  const clientName = (cliente || 'reporte').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = fecha || new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
  const filename = `comparador_${clientName}_${dateStr}.html`;
  
  // Descargar
  downloadHTML(htmlContent, filename);
  
  console.log(`✅ Snapshot HTML generado: ${filename}`);
}

/**
 * Genera un snapshot HTML de múltiples secciones
 */
export async function generateMultiSectionHTMLSnapshot(
  sections: { element: HTMLElement; title: string }[],
  options: HTMLSnapshotOptions
): Promise<void> {
  console.log('🚀 Generando snapshot HTML multi-sección...');
  
  const { title, cliente, fecha } = options;
  
  // Combinar todas las secciones
  let combinedContent = '';
  
  for (const section of sections) {
    const clone = section.element.cloneNode(true) as HTMLElement;
    
    // Remover elementos no deseados
    const elementsToRemove = clone.querySelectorAll('.no-export, button, input, select, textarea, [data-no-export]');
    elementsToRemove.forEach(el => el.remove());
    
    // Agregar título de sección
    combinedContent += `
      <section class="snapshot-section">
        <h2 class="text-xl font-bold mb-4 text-[var(--text-primary)]">${section.title}</h2>
        ${clone.innerHTML}
      </section>
    `;
  }
  
  // Generar el documento HTML
  const htmlContent = createHTMLDocument(combinedContent, options);
  
  // Generar nombre del archivo
  const clientName = (cliente || 'reporte').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = fecha || new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
  const filename = `comparador_${clientName}_${dateStr}.html`;
  
  // Descargar
  downloadHTML(htmlContent, filename);
  
  console.log(`✅ Snapshot HTML multi-sección generado: ${filename}`);
}

/**
 * Abre el snapshot en una nueva pestaña en lugar de descargarlo
 */
export async function openHTMLSnapshotInNewTab(
  element: HTMLElement,
  options: HTMLSnapshotOptions
): Promise<void> {
  console.log('🚀 Abriendo snapshot HTML en nueva pestaña...');
  
  // Clonar el elemento
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Remover elementos no deseados
  const elementsToRemove = clone.querySelectorAll('.no-export, button, input, select, textarea, [data-no-export]');
  elementsToRemove.forEach(el => el.remove());
  
  // Convertir canvas a imágenes
  const canvases = clone.querySelectorAll('canvas');
  for (const canvas of canvases) {
    try {
      const img = document.createElement('img');
      img.src = (canvas as HTMLCanvasElement).toDataURL('image/png');
      img.style.width = canvas.style.width || '100%';
      img.style.height = canvas.style.height || 'auto';
      canvas.replaceWith(img);
    } catch (e) {
      console.warn('No se pudo convertir un canvas a imagen:', e);
    }
  }
  
  // Generar el documento HTML
  const htmlContent = createHTMLDocument(clone.innerHTML, options);
  
  // Abrir en nueva pestaña
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  
  console.log('✅ Snapshot HTML abierto en nueva pestaña');
}

export default generateHTMLSnapshot;
