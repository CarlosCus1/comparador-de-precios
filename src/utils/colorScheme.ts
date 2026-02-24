// Esquema de colores unificado para todas las marcas usando valores hexadecimales directos
export const COLOR_SCHEME = {
  'Mi Marca': '#10b981',      // Verde principal
  'vinifan2': '#ef4444',      // Rojo
  'artesco': '#f59e0b',       // Naranja/Ámbar
  'layconsa': '#8b5cf6',      // Púrpura
  'vikingo': '#3b82f6',       // Azul
  'Competidor 5': '#06b6d4',  // Cyan
  'Competidor 6': '#84cc16',  // Lime
  'Competidor 7': '#f97316',  // Orange
  'Competidor 8': '#a855f7',  // Violet
  'Competidor 9': '#14b8a6', // Teal
  'default': '#64748b'        // Gris azulado (neutral)
} as const;

// Tipos para validación
export type BrandName = keyof typeof COLOR_SCHEME;

// Paleta de colores para marcas dinámicas
const BRAND_COLORS = [
  '#10b981', // Verde (primero para MI)
  '#3b82f6', // Azul
  '#ef4444', // Rojo
  '#f59e0b', // Ámbar
  '#8b5cf6', // Púrpura
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#a855f7', // Violet
  '#14b8a6', // Teal
  '#fbbf24', // Yellow
  '#6366f1', // Indigo
  '#ec4899', // Repeat if more
  '#3b82f6'
];

/**
 * Obtiene el color asignado a una marca
 * @param brandName Nombre de la marca
 * @returns Color hexadecimal
 */
export const getBrandColor = (brandName: string): string => {
  const normalizedBrandName = brandName.toLowerCase().trim();

  // Find the key in a case-insensitive way
  const schemeKey = Object.keys(COLOR_SCHEME).find(
    key => key.toLowerCase() === normalizedBrandName
  );

  if (schemeKey) {
    const fixedColor = COLOR_SCHEME[schemeKey as BrandName];
    if (fixedColor && fixedColor !== COLOR_SCHEME.default) {
      return fixedColor;
    }
  }

  // Si no está en el esquema fijo, usa un color dinámico basado en el nombre
  const hash = brandName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
};

/**
 * Genera una variante más oscura de un color
 * @param hex Color hexadecimal
 * @param percent Porcentaje de oscurecimiento (0-100)
 * @returns Color hexadecimal oscurecido
 */
export const shadeColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1).toUpperCase();
};

/**
 * Convierte un color hexadecimal a RGBA
 * @param hex Color hexadecimal
 * @param alpha Opacidad (0-1)
 * @returns Color RGBA
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Paleta de 5 colores fijos basados en la posición de la marca (marca1 a marca5)
export const POSITION_COLOR_PALETTE = [
  '#2563EB', // Pos 1: Azul Corporativo Principal
  '#EF4444', // Pos 2: Rojo Estándar
  '#16A34A', // Pos 3: Verde Sobrio
  '#F59E0B', // Pos 4: Ámbar (Amarillo-Naranja)
  '#7C3AED', // Pos 5: Morado Amatista
];

/**
 * Obtiene un color basado en la POSICIÓN de la marca en la lista de competidores.
 * @param brandName Nombre de la marca a buscar.
 * @param competidores Array completo de los nombres de los competidores.
 * @returns Color hexadecimal.
 */
export const getBrandColorByPosition = (brandName: string, competidores: string[]): string => {
  const index = competidores.findIndex(c => c.toLowerCase() === brandName.toLowerCase());
  if (index !== -1) {
    // Usa el módulo para que si hay más de 5 competidores, los colores se repitan cíclicamente.
    return POSITION_COLOR_PALETTE[index % POSITION_COLOR_PALETTE.length];
  }
  // Fallback a un color neutral si la marca no se encuentra, aunque no debería ocurrir.
  return '#64748B'; 
};

/**
 * Genera estilos de encabezado basados en la POSICIÓN de la marca.
 * @param brandName Nombre de la marca
 * @param competidores Array completo de los nombres de los competidores.
 * @returns Estilos CSS para el encabezado
 */
export const getBrandHeaderStylesByPosition = (brandName: string, competidores: string[]) => {
  const color = getBrandColorByPosition(brandName, competidores);
  const darkerColor = shadeColor(color, 20);
  const shadowColor = hexToRgba(color, 0.4);
  
  return {
    background: `linear-gradient(135deg, ${color}, ${darkerColor})`,
    color: 'white',
    boxShadow: `0 4px 15px ${shadowColor}`,
    border: 'none',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  };
};

// =================================================================================
// LEGACY: Funciones de color basadas en el nombre de la marca (conservadas por si acaso)
// =================================================================================


/**
 * Genera estilos consistentes para una barra de gráfico
 * @param brandName Nombre de la marca
 * @param isMyBrand Indica si es la marca principal
 * @returns Estilos CSS para la barra
 */
export const getBrandBarStyles = (brandName: string, isMyBrand: boolean = false) => {
  const color = getBrandColor(brandName);
  const shadowColor = hexToRgba(color, 0.4);
  
  return {
    backgroundColor: color,
    boxShadow: `0 4px 15px ${shadowColor}`,
    border: isMyBrand ? '2px solid white' : 'none',
    position: 'relative' as const,
    transition: 'all 0.3s ease'
  };
};

/**
 * Genera estilos consistentes para una barra de gráfico corporativo
 * @param brandName Nombre de la marca
 * @param isMyBrand Indica si es la marca principal
 * @returns Clase CSS para la barra
 */
export const getBrandBarClass = (brandName: string, isMyBrand: boolean = false): string => {
  if (isMyBrand) {
    return 'bar-my-brand';
  }
  
  const color = getBrandColor(brandName);
  
  // Mapeo de colores hexadecimales a clases CSS
  const colorClassMap: Record<string, string> = {
    '#3b82f6': 'bar-blue',    // Competidor 1
    '#10b981': 'bar-green',   // Competidor 2
    '#f59e0b': 'bar-amber',   // Competidor 3
    '#ef4444': 'bar-red',     // Competidor 4
    '#8b5cf6': 'bar-purple',  // Competidor 5
    '#06b6d4': 'bar-cyan',    // Competidor 6
    '#84cc16': 'bar-lime',    // Competidor 7
    '#f97316': 'bar-orange',  // Competidor 8
    '#a855f7': 'bar-violet',  // Competidor 9
    '#14b8a6': 'bar-teal',    // Competidor 10
    '#ec4899': 'bar-my-brand' // Mi Marca
  };
  
  return colorClassMap[color] || 'bar-default';
};

/**
 * Obtiene todos los colores del esquema para gráficos
 * @returns Array de colores en orden
 */
export const getAllBrandColors = (): string[] => {
  return Object.values(COLOR_SCHEME).slice(0, -1); // Excluye el default
};

/**
 * Valida si un nombre de marca es válido
 * @param brandName Nombre de la marca
 * @returns Booleano indicando si es válido
 */
export const isValidBrandName = (brandName: string): boolean => {
  return Object.keys(COLOR_SCHEME).includes(brandName);
};