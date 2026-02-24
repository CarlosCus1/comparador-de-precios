import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { getBrandColor } from '../../utils/colorScheme';

interface ProductComparisonCardProps {
  item: ComparisonTableRow;
  competidores: string[];
  onExpand?: (item: ComparisonTableRow) => void;
}

export const ProductComparisonCard: React.FC<ProductComparisonCardProps> = ({
  item,
  competidores,
  onExpand
}) => {
  // Calcular posición de tu marca (primer competidor)
  const myBrand = competidores[0];
  const myPrice = item.precios?.[myBrand] ?? 0;

  // Obtener precios de todos los competidores
  const allPrices = competidores.map(comp => ({
    label: comp,
    value: item.precios?.[comp] ?? null
  }));

  // Ordenar por precio para determinar posición
  const validPrices = allPrices.filter(p => p.value !== null);
  const sortedPrices = [...validPrices].sort((a, b) => (a.value || 0) - (b.value || 0));
  const myPosition = sortedPrices.findIndex(p => p.label === myBrand) + 1;

  // Calcular porcentajes de diferencia
  const percentageDifferences = allPrices
    .filter(p => p.label !== myBrand && p.value !== null && p.value > 0)
    .map(p => {
      const diff = ((p.value! - myPrice) / myPrice) * 100;
      return {
        name: p.label,
        percentage: diff,
        isBetter: diff < 0
      };
    });

  // Obtener diferencias más relevantes
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

  // Calcular precio promedio, min, max
  const avgPrice = validPrices.length > 0
    ? validPrices.reduce((sum, p) => sum + (p.value || 0), 0) / validPrices.length
    : 0;
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(p => p.value || 0)) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices.map(p => p.value || 0)) : 0;

  // Máximo precio para escalar barras
  const maxPriceValue = validPrices.length > 0 ? Math.max(...validPrices.map(p => p.value || 0)) : 1;

  return (
    <div className="product-comparison-card bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-h-[25vh] flex flex-col gap-4"
         onClick={() => onExpand?.(item)}>
      {/* Encabezado centrado arriba del gráfico */}
      <div className="header-section text-center mb-4">
        <h3 className="text-lg font-bold uppercase text-gray-900">{item.nombre}</h3>
        <div className="text-xl font-bold text-yellow-600">S/ {myPrice.toFixed(2)}</div>
      </div>

      {/* Contenido horizontal: gráfico a la izquierda, textos a la derecha */}
      <div className="content-section flex flex-col md:flex-row gap-4">
        {/* Gráfico de barras a la izquierda */}
        <div className="chart-section md:w-1/2">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Comparativa de Precios</h4>
          <div className="space-y-2">
            {allPrices.map((price, index) => {
              const priceValue = price.value;
              const isMyBrand = price.label === myBrand;
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
                      {priceValue ? `S/ ${priceValue.toFixed(2)}` : 'N/A'}
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
              Posición: {myPosition}°
            </span>
          </div>
          <div className="text-block">
            <span className="text-label">Comparativa textual:</span>
            <span className="text-value">Total marcas: {allPrices.length}</span>
          </div>
          {bestDiff && (
            <div className="text-block">
              <span className="text-label">Diferencia positiva:</span>
              <span className="text-value text-green-600 font-bold">
                Mejor vs {bestDiff.name}: ▼ {Math.abs(bestDiff.percentage).toFixed(2)}%
              </span>
            </div>
          )}
          {worstDiff && (
            <div className="text-block">
              <span className="text-label">Diferencia negativa:</span>
              <span className="text-value text-red-600 font-bold">
                Peor vs {worstDiff.name}: ▲ {Math.abs(worstDiff.percentage).toFixed(2)}%
              </span>
            </div>
          )}
          <div className="text-block">
            <span className="text-label">Precio promedio:</span>
            <span className="text-value">Precio promedio: S/ {avgPrice.toFixed(2)}</span>
          </div>
          <div className="text-block">
            <span className="text-label">Precio mínimo:</span>
            <span className="text-value">Min: S/ {minPrice.toFixed(2)}</span>
          </div>
          <div className="text-block">
            <span className="text-label">Precio máximo:</span>
            <span className="text-value">Máx: S/ {maxPrice.toFixed(2)}</span>
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