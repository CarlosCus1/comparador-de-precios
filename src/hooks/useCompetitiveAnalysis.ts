/**
 * Hook personalizado para análisis competitivo de precios
 * Centraliza toda la lógica de cálculo y análisis que estaba duplicada
 */

import { useMemo } from 'react';
import { ComparisonTableRow } from '../pages/ComparadorPage';
import { 
  PriceData, 
  CompetitiveAnalysis, 
  performCompetitiveAnalysis,
  calculatePriceStatistics 
} from '../utils/priceCalculations';

export interface UseCompetitiveAnalysisReturn {
  // Datos básicos
  myBrand: string;
  myPrice: number;
  allPrices: PriceData[];
  
  // Análisis competitivo
  analysis: CompetitiveAnalysis;
  
  // Estadísticas
  statistics: {
    average: number;
    min: number;
    max: number;
    count: number;
  };
  
  // Utilidades de formateo
  formatPrice: (price: number | null) => string;
  formatPercentage: (percentage: number) => string;
  formatPercentageWithIndicator: (percentage: number) => string;
}

export const useCompetitiveAnalysis = (
  item: ComparisonTableRow,
  competidores: string[]
): UseCompetitiveAnalysisReturn => {
  // Calcular datos básicos
  const basicData = useMemo(() => {
    const myBrand = competidores[0];
    const myPrice = item.precios?.[myBrand] ?? 0;
    
    // Obtener precios de todos los competidores
    const allPrices = competidores.map(comp => ({
      label: comp,
      value: item.precios?.[comp] ?? null
    }));

    return {
      myBrand,
      myPrice,
      allPrices
    };
  }, [item, competidores]);

  // Realizar análisis competitivo
  const analysis = useMemo(() => {
    return performCompetitiveAnalysis(basicData.allPrices, basicData.myBrand);
  }, [basicData.allPrices, basicData.myBrand]);

  // Calcular estadísticas
  const statistics = useMemo(() => {
    return calculatePriceStatistics(basicData.allPrices);
  }, [basicData.allPrices]);

  // Utilidades de formateo (memoizadas para evitar recreación)
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A';
    return `S/ ${price.toFixed(2)}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${Math.abs(percentage).toFixed(2)}%`;
  };

  const formatPercentageWithIndicator = (percentage: number) => {
    const indicator = percentage < 0 ? '▼' : '▲';
    return `${indicator} ${formatPercentage(percentage)}`;
  };

  return {
    ...basicData,
    analysis,
    statistics,
    formatPrice,
    formatPercentage,
    formatPercentageWithIndicator
  };
};