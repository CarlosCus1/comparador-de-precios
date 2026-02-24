/**
 * Versión refactorizada de ProductComparisonCard usando el nuevo hook
 * Este componente sirve como prueba para verificar que las utilidades funcionan igual
 */

import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { getBrandColor } from '../../utils/colorScheme';
import { useCompetitiveAnalysis } from '../../hooks/useCompetitiveAnalysis';

interface ProductComparisonCardRefactoredProps {
  item: ComparisonTableRow;
  competidores: string[];
  onExpand?: (item: ComparisonTableRow) => void;
}

export const ProductComparisonCardRefactored: React.FC<ProductComparisonCardRefactoredProps> = ({
  item,
  competidores,
  onExpand
}) => {
  // Usar el nuevo hook centralizado
  const {
    myBrand,
    myPrice,
    allPrices,
    analysis,
    statistics,
    formatPrice,
    formatPercentageWithIndicator
  } = useCompetitiveAnalysis(item, competidores);

  // Máximo precio para escalar barras
  const maxPriceValue = analysis.validPrices.length > 0 
    ? Math.max(...analysis.validPrices.map(p => p.value || 0)) 
    : 1;

  return (
    <div className="product-comparison-card bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-h-[25vh] flex flex-col gap-4"
         onClick={() => onExpand?.(item)}>
      {/* Encabezado centrado arriba del gráfico */}
      <div className="header-section text-center mb-4">
        <h3 className="text-lg font-bold uppercase text-gray-900">{item.nombre}</h3>
        <div className="text-xl font-bold text-yellow-600">{formatPrice(myPrice)}</div>
      </div>

      {/* Contenido horizontal: gráfico a la izquierda, textos a la derecha */}
      <div className="content-section flex flex-col md:flex-row gap-4">
        {/* Gráfico de barras a la izquierda */}
        <div className="chart-section md:w-1/2">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Comparativa de Precios</h4>
          <div className="space-y-2">
            {allPrices.map((price, index) => {
              const priceValue = price.value;
              const widthPercentage = priceValue ? (priceValue / maxPriceValue) * 100 : 0;
              const color = getBrandColor(price.label);

              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-16 text-xs font-medium text-gray-600 truncate">
                    {price.label === myBrand ? 'MI' : price.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: color
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {formatPrice(priceValue)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloques de texto a la derecha */}
        <div className="text-section md:w-1/2 space-y-3">
          <div className="text-block">
            <span className="text-label">Código de producto:</span>
            <span className="text-value">Código: {item.codigo}</span>
          </div>
          <div className="text-block">
            <span className="text-label">Ranking:</span>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
              Posición: {analysis.myPosition}°
            </span>
          </div>
          <div className="text-block">
            <span className="text-label">Comparativa textual:</span>
            <span className="text-value">Total marcas: {allPrices.length}</span>
          </div>
          {analysis.bestDiff && (
            <div className="text-block">
              <span className="text-label">Diferencia positiva:</span>
              <span className="text-value text-green-600 font-bold">
                Mejor vs {analysis.bestDiff.name}: {formatPercentageWithIndicator(analysis.bestDiff.percentage)}
              </span>
            </div>
          )}
          {analysis.worstDiff && (
            <div className="text-block">
              <span className="text-label">Diferencia negativa:</span>
              <span className="text-value text-red-600 font-bold">
                Peor vs {analysis.worstDiff.name}: {formatPercentageWithIndicator(analysis.worstDiff.percentage)}
              </span>
            </div>
          )}
          <div className="text-block">
            <span className="text-label">Precio promedio:</span>
            <span className="text-value">Precio promedio: {formatPrice(statistics.average)}</span>
          </div>
          <div className="text-block">
            <span className="text-label">Precio mínimo:</span>
            <span className="text-value">Min: {formatPrice(statistics.min)}</span>
          </div>
          <div className="text-block">
            <span className="text-label">Precio máximo:</span>
            <span className="text-value">Máx: {formatPrice(statistics.max)}</span>
          </div>
          <div className="text-block">
            <span className="text-label">Nombre del producto:</span>
            <span className="text-value font-bold uppercase">{item.nombre}</span>
          </div>
        </div>
      </div>
    </div>
  );
};