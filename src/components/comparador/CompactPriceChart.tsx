import React from 'react';
import { getBrandColor, getBrandBarClass } from '../../utils/colorScheme';

interface CompactPriceChartProps {
  prices: Array<{ label: string; value: number | null }>;
  myBrand?: string;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  onBarClick?: (brand: string, value: number) => void;
}

export const CompactPriceChart: React.FC<CompactPriceChartProps> = ({
  prices,
  myBrand,
  height = 60,
  showLabels = true,
  showValues = true,
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
    <div className="space-y-2">
      {/* Gráfico de barras */}
      <div className="flex items-end space-x-1" style={{ height: `${height}px` }}>
        {validPrices.map((price, index) => {
          const percentage = ((price.value || 0) / maxValue) * 100;
          const isMyBrand = price.label === myBrand;
          const barClass = getBrandBarClass(price.label, isMyBrand);
          
          return (
            <div
              key={index}
              className={`flex-1 flex flex-col items-center justify-end relative group cursor-pointer transition-all duration-200 hover:scale-105 ${barClass}`}
              style={{
                height: '100%',
                minHeight: '20px'
              }}
              onClick={() => onBarClick?.(price.label, price.value || 0)}
              title={`${price.label}: S/ ${(price.value || 0).toFixed(2)}`}
            >
              {/* Barra */}
              <div
                className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                style={{
                  height: `${percentage}%`,
                  minHeight: '10px'
                }}
              />
              
              {/* Valor en la barra */}
              {showValues && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/60 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  S/ {(price.value || 0).toFixed(2)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Etiquetas */}
      {showLabels && (
        <div className="flex justify-between text-xs text-[var(--text-secondary)] font-medium">
          {validPrices.map((price, index) => {
            const isMyBrand = price.label === myBrand;
            const color = getBrandColor(price.label);
            
            return (
              <div
                key={index}
                className="flex items-center space-x-1"
                style={{ color }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className={isMyBrand ? 'font-bold' : ''}>
                  {price.label === myBrand ? 'MI' : price.label.replace('Competidor ', 'C')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};