/**
 * Componente DrillDownChart - Drill-down jerárquico para exploración de datos
 * Permite navegar desde dashboard general → marcas → productos → detalles específicos
 */
import React, { useState, useCallback, useMemo } from 'react';
import type { IProductoEditado } from '../../interfaces';

interface DrillDownData {
  name: string;
  value: number;
  children?: DrillDownData[];
  details?: Record<string, unknown>;
}

interface DrillDownChartProps {
  data: DrillDownData[];
  title?: string;
  onDrillDown?: (path: string[]) => void;
  onReset?: () => void;
  colors?: string[];
  ariaLabel?: string;
}

// Colores WCAG AAA para gráficos usando variables CSS
const getChartColors = () => [
  getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563EB',
  getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#059669',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#7C3AED',
  getComputedStyle(document.documentElement).getPropertyValue('--color-danger').trim() || '#DC2626',
  getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#F59E0B',
  getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim() || '#10B981',
  getComputedStyle(document.documentElement).getPropertyValue('--color-error').trim() || '#EF4444',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#8B5CF6'
];

interface BreadcrumbItem {
  name: string;
  level: number;
}

export const DrillDownChart: React.FC<DrillDownChartProps> = ({
  data,
  title = 'Exploración de Datos',
  onDrillDown,
  onReset,
  colors = getChartColors(),
  ariaLabel = 'Gráfico interactivo con navegación jerárquica'
}) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedItem, setSelectedItem] = useState<DrillDownData | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { name: 'Inicio', level: 0 }
  ]);

  // Obtener datos del nivel actual
  const currentData = useMemo(() => {
    if (breadcrumb.length === 1) return data;
    
    let current: DrillDownData[] = data;
    for (let i = 1; i < breadcrumb.length; i++) {
      const item = current.find(c => c.name === breadcrumb[i].name);
      current = item?.children || [];
    }
    return current;
  }, [data, breadcrumb]);

  // Manejar click en segmento
  const handleSegmentClick = useCallback((entry: DrillDownData) => {
    const newBreadcrumb = [...breadcrumb, { name: entry.name, level: currentLevel + 1 }];
    setBreadcrumb(newBreadcrumb);
    setSelectedItem(entry);
    setCurrentLevel(prev => prev + 1);
    
    onDrillDown?.(newBreadcrumb.map(b => b.name));
  }, [breadcrumb, currentLevel, onDrillDown]);

  // Navegar hacia atrás
  const handleGoBack = useCallback(() => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = breadcrumb.slice(0, -1);
      setBreadcrumb(newBreadcrumb);
      setCurrentLevel(prev => Math.max(0, prev - 1));
      setSelectedItem(null);
    }
  }, [breadcrumb]);

  // Resetear a nivel inicial
  const handleReset = useCallback(() => {
    setBreadcrumb([{ name: 'Inicio', level: 0 }]);
    setCurrentLevel(0);
    setSelectedItem(null);
    onReset?.();
  }, [onReset]);

  // Generar descripción accesible
  const accessibleDescription = useMemo(() => {
    const levelNames = breadcrumb.map(b => b.name).join(' → ');
    const dataSummary = currentData
      .slice(0, 5)
      .map(d => `${d.name}: ${d.value.toFixed(2)}`)
      .join(', ');
    return `Nivel actual: ${levelNames}. Elementos: ${dataSummary}${currentData.length > 5 ? '. y más.' : '.'}`;
  }, [breadcrumb, currentData]);

  // Determinar si tiene hijos (para mostrar como torta o barras)
  const hasChildren = currentData.length > 0 && currentData[0].children !== undefined;

  return (
    <div 
      className="drilldown-chart glass-card p-4" 
      role="application" 
      aria-label={ariaLabel}
    >
      {/* Encabezado con título y controles */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        
        {/* Breadcrumb navigation */}
        <nav 
          className="flex items-center gap-2 text-sm" 
          aria-label="Ruta de navegación"
          role="navigation"
        >
          <ol className="flex items-center gap-1">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-[var(--text-tertiary)]" aria-hidden="true">/</span>
                )}
                <button
                  onClick={() => {
                    const newBreadcrumb = breadcrumb.slice(0, index + 1);
                    setBreadcrumb(newBreadcrumb);
                    setCurrentLevel(index);
                    if (index === 0) setSelectedItem(null);
                  }}
                  className={`px-2 py-1 rounded transition-colors ${
                    index === currentLevel 
                      ? 'bg-[var(--color-comparador-primary)] text-white' 
                      : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
                  aria-current={index === currentLevel ? 'page' : undefined}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Descripción accesible */}
      <div className="sr-only" aria-live="polite">
        {accessibleDescription}
      </div>

      {/* Gráfico de barras simple */}
      <div className="space-y-2">
        {currentData.map((entry, index) => (
          <div key={index}>
            <button
              onClick={() => handleSegmentClick(entry)}
              className="w-full flex items-center gap-4 p-3 rounded-lg border border-[var(--border-primary)] hover:border-[var(--color-comparador-primary)] hover:bg-[var(--color-comparador-primary)]/5 transition-all text-left group"
              aria-label={`${entry.name}: ${entry.value.toFixed(2)}. Click para ver detalles.`}
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: colors[index % colors.length] }}
                aria-hidden="true"
              />
              <span className="flex-1 font-medium text-[var(--text-primary)] group-hover:text-[var(--color-comparador-primary)]">
                {entry.name}
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                S/ {entry.value.toFixed(2)}
              </span>
              {entry.children && (
                <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {/* Barra de progreso visual */}
            <div className="h-1 w-full bg-[var(--bg-tertiary)] rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (entry.value / Math.max(...currentData.map(d => d.value))) * 100)}%`,
                  backgroundColor: colors[index % colors.length]
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Panel de detalles del ítem seleccionado */}
      {selectedItem && (
        <div 
          className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]"
          role="region"
          aria-label="Detalles del elemento seleccionado"
        >
          <h4 className="font-bold text-[var(--text-primary)] mb-2">
            Detalles: {selectedItem.name}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-[var(--text-secondary)]">Valor: </span>
              <span className="font-bold text-[var(--color-comparador-primary)]">
                S/ {selectedItem.value.toFixed(2)}
              </span>
            </div>
            {selectedItem.details && Object.entries(selectedItem.details).map(([key, value]) => (
              <div key={key}>
                <span className="text-[var(--text-secondary)]">{key}: </span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controles de navegación */}
      <div className="flex justify-between mt-4" role="group" aria-label="Controles de navegación">
        <button
          onClick={handleGoBack}
          disabled={breadcrumb.length === 1}
          className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Volver al nivel anterior"
        >
          ← Volver
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-[var(--color-comparador-primary)] text-white rounded-lg hover:bg-[var(--color-comparador-dark)] transition-colors"
          aria-label="Restablecer a vista inicial"
        >
          Restablecer Vista
        </button>
      </div>
    </div>
  );
};

// Componente para drill-down de productos por marca
interface ProductDrillDownProps {
  products: IProductoEditado[];
  competitors: string[];
  onProductSelect?: (product: IProductoEditado) => void;
}

export const ProductDrillDown: React.FC<ProductDrillDownProps> = ({
  products,
  competitors,
  onProductSelect
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProductoEditado | null>(null);

  // Agrupar productos por marca
  const brandData = useMemo(() => {
    const brands: { [key: string]: { count: number; totalPrice: number; products: IProductoEditado[] } } = {};
    
    products.forEach(product => {
      competitors.forEach(brand => {
        const price = product.precios?.[brand];
        if (price && price > 0) {
          if (!brands[brand]) {
            brands[brand] = { count: 0, totalPrice: 0, products: [] };
          }
          brands[brand].count++;
          brands[brand].totalPrice += price;
          brands[brand].products.push(product);
        }
      });
    });

    return Object.entries(brands).map(([name, data]) => ({
      name,
      value: data.count,
      avgPrice: data.totalPrice / data.count,
      children: data.products.slice(0, 10).map(p => ({
        name: p.nombre || p.codigo,
        value: p.precio_promedio || 0,
        details: { codigo: p.codigo, linea: p.linea }
      }))
    }));
  }, [products, competitors]);

  const handleProductClick = useCallback((product: IProductoEditado) => {
    setSelectedProduct(product);
    onProductSelect?.(product);
  }, [onProductSelect]);

  return (
    <div className="space-y-4">
      {!selectedBrand ? (
        <DrillDownChart
          data={brandData}
          title="Explorar por Marca"
          onDrillDown={(path) => {
            if (path.length > 1) setSelectedBrand(path[1]);
          }}
        />
      ) : (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Productos de {selectedBrand}
            </h3>
            <button
              onClick={() => setSelectedBrand(null)}
              className="px-3 py-1 bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              ← Volver a Marcas
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter(p => p.precios?.[selectedBrand] && p.precios[selectedBrand]! > 0)
              .slice(0, 20)
              .map(product => (
                <div
                  key={product.codigo}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedProduct?.codigo === product.codigo
                      ? 'border-[var(--color-comparador-primary)] bg-[var(--color-comparador-primary)]/5'
                      : 'border-[var(--border-primary)] hover:border-[var(--color-comparador-primary)]'
                  }`}
                  onClick={() => handleProductClick(product)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProductClick(product);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h4 className="font-medium text-[var(--text-primary)] truncate">
                    {product.nombre}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Código: {product.codigo}
                  </p>
                  <p className="text-lg font-bold text-[var(--color-comparador-primary)]">
                    S/ {product.precios?.[selectedBrand]?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillDownChart;
