import React from 'react';
import { ComparisonTableRow } from '../../pages/ComparadorPage';
import { getBrandBarClass } from '../../utils/colorScheme';
import { useCompetitiveAnalysis } from '../../hooks/useCompetitiveAnalysis';

interface ProductAnalysisCardProps {
  item: ComparisonTableRow;
  competidores: string[];
}

export const ProductAnalysisCard: React.FC<ProductAnalysisCardProps> = ({ item, competidores }) => {
  // Usar el hook centralizado para análisis competitivo
  const {
    myBrand,
    allPrices,
    analysis,
    formatPrice,
    formatPercentage
  } = useCompetitiveAnalysis(item, competidores);

  // Convertir allPrices al formato esperado por el componente
  const adaptedPrices = allPrices.map(p => ({
    name: p.label,
    price: p.value || 0,
    isMyBrand: p.label === myBrand
  })).filter(p => p.price > 0);

  // Obtener diferencias del análisis usando el hook
  const percentageDifferences = adaptedPrices
    .filter(p => !p.isMyBrand && p.price > 0)
    .map(p => {
      const myPrice = adaptedPrices.find(price => price.isMyBrand)?.price || 0;
      const percentage = ((p.price - myPrice) / myPrice) * 100;
      return {
        name: p.name,
        percentage,
        isBetter: percentage < 0
      };
    });

  // Determinar clase de posición
  const getPositionClass = (position: number) => {
    switch (position) {
      case 1: return 'position-1';
      case 2: return 'position-2';
      case 3: return 'position-3';
      default: return 'position-4';
    }
  };

  // Determinar clase de barra
  const getBarClass = (isMyBrand: boolean, brandName: string) => {
    return getBrandBarClass(brandName, isMyBrand);
  };

  return (
    <div className="product-card-corporate animate-fade-in">
      {/* Encabezado del producto */}
      <div className="product-header">
        <h3 className="text-lg font-bold">{item.nombre}</h3>
        <p className="product-code">Código: {item.codigo}</p>
      </div>

      {/* Gráfico de barras */}
      <div className="bar-chart-container">
        <h4 className="text-sm font-semibold mb-3">Comparativa de Precios</h4>
        <div className="space-y-3">
          {adaptedPrices.map((price) => (
            <div key={price.name} className="bar-item">
              <span className="bar-label font-medium">
                {price.name}
                {price.isMyBrand && <span className="ml-2 px-2 py-1 bg-[var(--bg-tertiary)] rounded-full text-xs border border-[var(--border-secondary)]">Mi Marca</span>}
              </span>
              <div className="bar-progress">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarClass(price.isMyBrand, price.name)}`}
                  style={{ width: '0%' }}
                  data-target-width={`${(price.price / Math.max(...adaptedPrices.map(p => p.price))) * 100}%`}
                ></div>
              </div>
              <span className="bar-value font-bold">
                {formatPrice(price.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de posición */}
      <div className="mb-4">
        <div className={`position-badge ${getPositionClass(analysis.myPosition)}`}>
          <div className="w-3 h-3 bg-white rounded-full"></div>
          Posición: {analysis.myPosition}°
          <span className="text-sm font-normal opacity-90">
            de {adaptedPrices.length} marcas
          </span>
        </div>
      </div>

      {/* Porcentajes de diferencia */}
      <div className="percentage-section">
        <h4 className="text-sm font-semibold mb-2">Diferencia vs Competidores</h4>
        <div className="space-y-2">
          {percentageDifferences.map((diff) => (
            <div
              key={diff.name}
              className={`percentage-item ${diff.isBetter ? 'percentage-positive' : 'percentage-negative'}`}
            >
              <span className="text-sm">{diff.name}</span>
              <div className="flex items-center gap-2">
                <span className={`percentage-icon ${diff.isBetter ? 'icon-up' : 'icon-down'}`}>
                  {diff.isBetter ? '▲' : '▼'}
                </span>
                <span className="percentage-value font-bold">
                  {formatPercentage(diff.percentage)}
                </span>
                <span className="text-xs">
                  {diff.isBetter ? 'Más barato' : 'Más caro'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
