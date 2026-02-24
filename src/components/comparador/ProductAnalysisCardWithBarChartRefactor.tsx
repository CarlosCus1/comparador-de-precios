import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { getBrandColorByPosition } from '../../utils/colorScheme';
import '../../styles/print-report.css';

interface ProductAnalysisCardWithBarChartRefactorProps {
  item: ComparisonTableRow;
  competidores: string[];
  onExpand?: (item: ComparisonTableRow) => void;
  highlightedBrand?: string | null;
  onBrandHover?: (brandName: string | null) => void;
}

export const ProductAnalysisCardWithBarChartRefactor: React.FC<ProductAnalysisCardWithBarChartRefactorProps> = ({
  item,
  competidores,
  onExpand,
  highlightedBrand,
  onBrandHover,
}) => {
  const myBrand = competidores[0];
  const myPrice = item.precios?.[myBrand] ?? 0;
  
  const allPrices = competidores.map(comp => ({
    label: comp,
    value: item.precios?.[comp] ?? null
  }));

  const validPrices = allPrices.filter(p => p.value !== null && p.value > 0);
  const sortedPrices = [...validPrices].sort((a, b) => (a.value || 0) - (b.value || 0));
  const myPosition = sortedPrices.findIndex(p => p.label === myBrand) + 1;

  const percentageDifferences = allPrices
    .filter(p => p.label !== myBrand && p.value !== null && p.value > 0 && myPrice > 0)
    .map(p => {
      const diff = ((p.value! - myPrice) / myPrice) * 100;
      return {
        name: p.label,
        percentage: diff,
        isBetter: diff < 0
      };
    });

  const bestDiff = percentageDifferences.filter(p => p.isBetter).sort((a,b) => a.percentage - b.percentage)[0] || null;
  const worstDiff = percentageDifferences.filter(p => !p.isBetter).sort((a,b) => b.percentage - a.percentage)[0] || null;

  const avgPrice = validPrices.length > 0 ? validPrices.reduce((sum, p) => sum + (p.value || 0), 0) / validPrices.length : 0;
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(p => p.value || 0)) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices.map(p => p.value || 0)) : 0;
  
  const maxChartValue = validPrices.length > 0 ? Math.max(...validPrices.map(p => p.value || 0)) : 1;

  const chartData = competidores.map((brandName, index) => {
    const label = index === 0 ? 'MI' : brandName;
    const priceData = allPrices.find(p => p.label.toLowerCase() === brandName.toLowerCase());
    
    let percentageDiff: string | undefined = undefined;
    if (index > 0) { // Solo para competidores
        const percentageKey = `% vs ${brandName}`;
        const value = item[percentageKey] as string | undefined;
        // Asumimos que el valor ya es un string formateado como "xx.x%"
        if (value) {
          percentageDiff = value;
        }
    }

    return {
      label: label,
      value: priceData?.value ?? null,
      originalName: brandName,
      percentage: percentageDiff,
    };
  });

  return (
    <div 
      className="product-comparison-card bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 print:h-[25vh] print:shadow-none print:border-gray-300 print:p-2 print:break-inside-avoid"
      onClick={() => onExpand?.(item)}
      role="button"
      tabIndex={0}
    >
      {/* Columna Izquierda: Encabezado y Gráfico */}
      <div className="left-column md:w-1/2 flex flex-col">
        <div className="header-section text-center mb-2">
          <h3 className="text-base font-bold uppercase text-[var(--text-primary)] print:text-sm">{item.nombre}</h3>
          <div className="text-lg font-bold bg-yellow-300 text-yellow-900 px-2 py-1 rounded-md print:text-base">S/ {myPrice.toFixed(2)}</div>
        </div>

        <div className="chart-section flex-grow flex flex-col justify-center">
          <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 print:text-xs">Comparativa de Precios</h4>
          <div className="space-y-1.5">
            {chartData.map((price, index) => {
              const widthPercentage = price.value ? (price.value / maxChartValue) * 100 : 0;
              const color = getBrandColorByPosition(price.originalName, competidores);
              const isDimmed = highlightedBrand && highlightedBrand.toLowerCase() !== price.originalName.toLowerCase();

              return (
                <div 
                  key={index} 
                  className={`flex items-center gap-2 text-xs print:text-[10px] transition-opacity duration-200 ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
                  onMouseEnter={() => onBrandHover?.(price.originalName)}
                  onMouseLeave={() => onBrandHover?.(null)}
                >
                  <div className="w-16 font-medium text-[var(--text-tertiary)] truncate">{price.label}</div>
                  <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-5 print:h-4 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: color,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold">
                      <span className="bg-black/20 px-1 rounded text-white">{price.value ? `S/ ${price.value.toFixed(2)}` : 'N/A'}</span>
                      {price.percentage && (
                        <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${parseFloat(price.percentage) < 0 ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                          {parseFloat(price.percentage) < 0 ? '▼' : '▲'}
                          {price.percentage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Bloques de texto */}
      <div className="right-column md:w-1/2 flex items-stretch">
        <div className="text-section w-full grid grid-cols-2 gap-2 text-sm print:text-xs">
          <InfoBlock label="Código" value={item.codigo} />
          <InfoBlock label="Ranking">
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20 rounded-full text-xs font-bold">
              {myPosition > 0 ? `${myPosition}°` : 'N/A'}
            </span>
          </InfoBlock>
          <InfoBlock label="Total marcas" value={validPrices.length} />
          {bestDiff ? (
            <InfoBlock label="Mejor vs MI" value={`▼ ${Math.abs(bestDiff.percentage).toFixed(2)}%`} specialStyle="success" />
          ) : <div className="bg-[var(--surface-secondary)] rounded-md" />}
          {worstDiff ? (
            <InfoBlock label="Peor vs MI" value={`▲ ${Math.abs(worstDiff.percentage).toFixed(2)}%`} specialStyle="danger" />
          ) : <div className="bg-[var(--surface-secondary)] rounded-md" />}
          <InfoBlock 
            label="Precio Sugerido" 
            value={item.precio_sugerido ? `S/ ${item.precio_sugerido.toFixed(2)}` : 'N/A'}
            valueClassName="text-[var(--color-accent)] font-bold"
          />
          <InfoBlock label="Precio mínimo" value={`S/ ${minPrice.toFixed(2)}`} />
          <InfoBlock label="Precio máximo" value={`S/ ${maxPrice.toFixed(2)}`} />
          <div className="col-span-2">
            <InfoBlock label="Producto" value={item.nombre} valueClassName="uppercase text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para los bloques de información
const InfoBlock: React.FC<{
  label: string;
  value?: string | number;
  valueClassName?: string;
  children?: React.ReactNode;
  specialStyle?: 'success' | 'danger' | null;
}> = ({ label, value, valueClassName, children, specialStyle = null }) => {

  const styleClasses = {
    base: 'text-block p-2 rounded-md flex justify-between items-center h-full',
    success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20',
    danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20',
    default: 'bg-[var(--surface-secondary)]',
  };

  const labelColor = specialStyle ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]';
  const valueColor = specialStyle ? `font-bold` : '';
  
  const finalClassName = `${styleClasses.base} ${specialStyle ? styleClasses[specialStyle] : styleClasses.default}`;

  return (
    <div className={finalClassName}>
      <span className={`font-semibold ${labelColor}`}>{label}:</span>
      {value !== undefined && <span className={`block ${valueColor} ${valueClassName || ''}`}>{value}</span>}
      {children}
    </div>
  );
};