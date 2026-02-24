import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { getBrandColor } from '../../utils/colorScheme';
import { useCompetitiveAnalysis } from '../../hooks/useCompetitiveAnalysis';

interface ProductAnalysisCardFinalProps {
  item: ComparisonTableRow;
  competidores: string[];
  onExpand?: (item: ComparisonTableRow) => void;
}

export const ProductAnalysisCardFinal: React.FC<ProductAnalysisCardFinalProps> = ({
  item,
  competidores,
  onExpand
}) => {
  // Usar el hook centralizado para análisis competitivo
  const {
    myBrand,
    allPrices,
    analysis,
    formatPrice,
    formatPercentage
  } = useCompetitiveAnalysis(item, competidores);

  // Calcular porcentajes de diferencia usando los datos del hook
  const percentageDifferences = allPrices
    .filter(p => p.label !== myBrand && p.value !== null && p.value > 0)
    .map(p => {
      const myPrice = allPrices.find(price => price.label === myBrand)?.value || 0;
      const diff = ((p.value! - myPrice) / myPrice) * 100;
      return {
        name: p.label,
        percentage: diff,
        isBetter: diff < 0
      };
    });

  // Filtrar precios válidos para cálculos
  const validPrices = allPrices.filter(p => p.value !== null);

  // Obtener diferencias más relevantes (mejor y peor)
  const bestDiff = percentageDifferences.length > 0
    ? percentageDifferences.reduce((best, current) =>
        current.isBetter && (!best || current.percentage < best.percentage) ? current : best
      )
    : null;
  
  const worstDiff = percentageDifferences.length > 0
    ? percentageDifferences.reduce((worst, current) =>
        !current.isBetter && (!worst || current.percentage > worst.percentage) ? current : worst
      )
    : null;

  // Determinar clase de posición
  const getPositionClass = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-grey-300 to-grey-500 border-grey-400';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-300';
      default: return 'bg-gradient-to-r from-grey-600 to-grey-800 border-grey-700';
    }
  };

  // Función para obtener la clase de color de una marca
  const getBrandColorClass = (brandName: string): string => {
    switch (brandName) {
      case 'Mi Marca': return 'bar-color-mi-marca';
      case 'Competidor 1': return 'bar-color-competidor-1';
      case 'Competidor 2': return 'bar-color-competidor-2';
      case 'Competidor 3': return 'bar-color-competidor-3';
      case 'Competidor 4': return 'bar-color-competidor-4';
      case 'Competidor 5': return 'bar-color-competidor-5';
      default: return 'bar-color-competidor-1';
    }
  };

  // Función para obtener el color de una marca (para el dot) - Usando variables CSS
  // const getBrandColor = (brandName: string): string => {
  //   const colorMap: Record<string, string> = {
  //     'Mi Marca': 'var(--color-mi-marca)',
  //     'Competidor 1': 'var(--color-competidor-1)',
  //     'Competidor 2': 'var(--color-competidor-2)',
  //     'Competidor 3': 'var(--color-competidor-3)',
  //     'Competidor 4': 'var(--color-competidor-4)',
  //     'Competidor 5': 'var(--color-competidor-5)'
  //   };
  //   return colorMap[brandName] || 'var(--color-neutral)';
  // };

  // Calcular altura de barras basada en el ejemplo de demostración
  const calculateBarHeight = (priceValue: number | null, maxValue: number): number => {
    if (priceValue === null || priceValue <= 0 || maxValue <= 0) return 0;
    const normalizedValue = priceValue / maxValue;
    return 70 + (normalizedValue * 20); // Rango de 70% a 90%
  };

  const maxValue = validPrices.length > 0 ? Math.max(...validPrices.map(p => p.value || 0)) : 1;

  return (
    <div className="product-card-corporate animate-fade-in cursor-pointer transition-all duration-300 hover:shadow-lg min-h-64 flex flex-col md:flex-row gap-4"
         onClick={() => onExpand?.(item)}>
      {/* Encabezado del producto */}
      <div className="product-header">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{item.nombre}</h3>
            <p className="product-code">Código: {item.codigo}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--color-comparador-primary)]">
              {formatPrice(allPrices.find(p => p.label === myBrand)?.value || 0)}
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border-2 ${getPositionClass(analysis.myPosition)}`}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Posición: {analysis.myPosition}°
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras de Comparación - Estilo Vertical */}
      <div className="chart-section md:w-1/2">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Comparativa de Precios</h4>
        <div className="bars-container-vertical">
          {allPrices.map((price, index) => {
            const priceValue = price.value;
            const isMyBrand = price.label === myBrand;
            const colorClass = getBrandColorClass(price.label);
            const heightPercentage = calculateBarHeight(priceValue, maxValue);
            const displayValue = priceValue !== null ? formatPrice(priceValue) : 'N/A';
            
            return (
              <div key={index} className="bar-vertical">
                {/* Valor en hover */}
                <div className="bar-value-hover">{displayValue}</div>
                
                {/* Barra vertical */}
                <div
                  className={`bar-vertical-progress ${isMyBrand ? 'my-brand' : ''} ${colorClass}`}
                  style={{
                    height: `${heightPercentage}%`,
                    minHeight: '10px'
                  }}
                />
                
                {/* Etiqueta de marca */}
                <div className="bar-vertical-label">
                  <div
                    className={`bar-vertical-dot ${isMyBrand ? 'my-brand' : ''}`}
                    style={{ backgroundColor: getBrandColor(price.label) }}
                  />
                  <span className={`bar-vertical-text ${isMyBrand ? 'my-brand' : ''}`}>
                    {price.label === myBrand ? 'MI' : price.label.replace('Competidor ', 'C')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información resumida */}
      <div className="info-section md:w-1/2">
        <div className="grid grid-cols-1 gap-3">
          {/* Diferencias clave */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-secondary)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Diferencias Clave</h4>
            <div className="space-y-1">
              {bestDiff && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Mejor vs {bestDiff.name}</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/30 rounded text-xs font-bold">
                    ▼ {formatPercentage(bestDiff.percentage)}
                  </span>
                </div>
              )}
              {worstDiff && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Peor vs {worstDiff.name}</span>
                  <span className="px-2 py-1 bg-red-500/10 text-red-600 border border-red-500/30 rounded text-xs font-bold">
                    ▲ {formatPercentage(worstDiff.percentage)}
                  </span>
                </div>
              )}
              {(!bestDiff && !worstDiff) && (
                <div className="text-sm text-[var(--text-secondary)]">Sin comparativas</div>
              )}
            </div>
          </div>

          {/* Resumen de competidores */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-secondary)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Resumen</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-[var(--text-secondary)]">Total marcas:</span>
              <span className="font-medium">{allPrices.length}</span>
              <span className="text-[var(--text-secondary)]">Precio promedio:</span>
              <span className="font-medium text-[var(--color-comparador-primary)]">
                {formatPrice(validPrices.reduce((sum, p) => sum + (p.value || 0), 0) / validPrices.length)}
              </span>
              <span className="text-[var(--text-secondary)]">Precio mínimo:</span>
              <span className="font-medium text-green-600">
                {formatPrice(Math.min(...validPrices.map(p => p.value || 0)))}
              </span>
              <span className="text-[var(--text-secondary)]">Precio máximo:</span>
              <span className="font-medium text-red-600">
                {formatPrice(Math.max(...validPrices.map(p => p.value || 0)))}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de expansión */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Click para ver detalles completos</span>
            <div className="w-4 h-4 border-2 border-[var(--border-primary)] rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};