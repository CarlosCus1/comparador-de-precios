import React from 'react';
import { getBrandColor, hexToRgba } from '../../utils/colorScheme';

interface BarChartComparisonProps {
  prices: Array<{ label: string; value: number | null }>;
  myBrand?: string;
  height?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  onBarClick?: (brand: string, value: number) => void;
}

export const BarChartComparison: React.FC<BarChartComparisonProps> = ({
  prices,
  myBrand,
  height = 200,
  showLabels = true,
  showLegend = true,
  onBarClick
}) => {
  // Filtrar precios válidos y ordenar por valor
  const validPrices = prices
    .filter(p => p.value !== null && p.value > 0)
    .sort((a, b) => (a.value || 0) - (b.value || 0));

  if (validPrices.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-sm text-[var(--text-secondary)]">
        No hay datos disponibles
      </div>
    );
  }

  const maxValue = Math.max(...validPrices.map(p => p.value || 0));

  return (
    <div className="space-y-3">
      {/* Gráfico de barras verticales */}
      <div className="flex items-end space-x-2" style={{ height: `${height}px` }}>
        {validPrices.map((price, index) => {
          const priceValue = price.value || 0;
          const isMyBrand = price.label === myBrand;
          const color = getBrandColor(price.label);
          
          // Calcular altura proporcional basada en el ejemplo de demostración
          // Usar un rango de 70% a 90% para una mejor visualización
          let heightPercentage = 80; // Altura base
          if (maxValue > 0) {
            const normalizedValue = priceValue / maxValue;
            // Ajustar para que las diferencias sean más visibles
            heightPercentage = 70 + (normalizedValue * 20);
          }
          
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end group cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={() => onBarClick?.(price.label, price.value || 0)}
              title={`${price.label}: S/ ${(price.value || 0).toFixed(2)}`}
              style={{ minHeight: '20px' }}
            >
              {/* Barra vertical */}
              <div
                className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${
                  isMyBrand ? 'ring-2 ring-white ring-opacity-80 shadow-lg' : ''
                }`}
                style={{
                  height: `${heightPercentage}%`,
                  minHeight: '10px',
                  backgroundColor: color,
                  boxShadow: `0 4px 15px ${hexToRgba(color, 0.4)}`
                }}
              />
              
              {/* Valor en la barra */}
              {showLabels && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/60 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  S/ {(price.value || 0).toFixed(2)}
                </div>
              )}
              
              {/* Etiqueta de marca */}
              <div className="mt-2 text-center">
                <div
                  className={`w-3 h-3 rounded-full border-2 mb-1 ${
                    isMyBrand ? 'border-white shadow-lg' : 'border-[var(--border-secondary)]'
                  }`}
                  style={{ backgroundColor: color }}
                />
                <span className={`text-xs ${
                  isMyBrand ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}>
                  {price.label === myBrand ? 'MI' : price.label.replace('Competidor ', 'C')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      {showLegend && (
        <div className="border-t border-[var(--border-secondary)] pt-3">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Leyenda de Colores</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {validPrices.map((price, index) => {
              const isMyBrand = price.label === myBrand;
              const color = getBrandColor(price.label);
              
              return (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      isMyBrand ? 'border-white shadow-lg' : 'border-[var(--border-secondary)]'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                  <span className={isMyBrand ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>
                    {price.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
