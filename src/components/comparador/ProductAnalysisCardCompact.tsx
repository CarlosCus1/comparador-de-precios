import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { CompactPriceChart } from './CompactPriceChart';
import { useCompetitiveAnalysis } from '../../hooks/useCompetitiveAnalysis';

interface ProductAnalysisCardCompactProps {
  item: ComparisonTableRow;
  competidores: string[];
  onExpand?: (item: ComparisonTableRow) => void;
}

export const ProductAnalysisCardCompact: React.FC<ProductAnalysisCardCompactProps> = ({
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


  return (
    <div className="product-card-corporate animate-fade-in cursor-pointer transition-all duration-300 hover:shadow-lg" 
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

      {/* Gráfico Compacto */}
      <div className="bar-chart-container">
        <CompactPriceChart
          prices={allPrices}
          myBrand={myBrand}
          height={80}
          showLabels={true}
          showValues={true}
        />
      </div>

      {/* Información resumida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              {formatPrice(allPrices.reduce((sum, p) => sum + (p.value || 0), 0) / allPrices.length)}
            </span>
            <span className="text-[var(--text-secondary)]">Precio mínimo:</span>
            <span className="font-medium text-green-600">
              {formatPrice(Math.min(...allPrices.map(p => p.value || 0)))}
            </span>
            <span className="text-[var(--text-secondary)]">Precio máximo:</span>
            <span className="font-medium text-red-600">
              {formatPrice(Math.max(...allPrices.map(p => p.value || 0)))}
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
  );
};