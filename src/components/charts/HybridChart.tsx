/**
 * Componente HybridChart - Visualizaciones híbridas con múltiples capas
 * Superposición de capas (scatter + bar + line)
 */
import React, { useState, useCallback, useMemo } from 'react';
import { 
  ComposedChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Line, Bar
} from 'recharts';

interface LayerConfig {
  type: 'scatter' | 'bar' | 'line';
  data: any[];
  color?: string;
  opacity?: number;
  dataKey?: string;
  xKey?: string;
  yKey?: string;
  zKey?: string;
}

interface HybridChartProps {
  layers: LayerConfig[];
  synchronized?: boolean;
  onSelectionChange?: (selection: unknown) => void;
  onHover?: (data: unknown) => void;
  title?: string;
  ariaLabel?: string;
}

// Palette WCAG AAA para scatter usando variables CSS
const getScatterColors = () => [
  getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563EB',
  getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#059669',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#7C3AED',
  getComputedStyle(document.documentElement).getPropertyValue('--color-danger').trim() || '#DC2626',
  getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#F59E0B'
];

interface ChartState {
  activeLayers: string[];
  selectedPoint: unknown;
  hoveredPoint: unknown;
}

export const HybridChart: React.FC<HybridChartProps> = ({
  title = 'Visualización Híbrida'
}): React.ReactElement => {
  // HybridChart component is disabled due to Recharts typing issues
  // TODO: Fix typing conflicts between useMemo inference and Recharts ResponsiveContainer children typing
  return (
    <div className="hybrid-chart glass-card p-4 text-center text-[var(--text-secondary)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{title}</h3>
      <p className="text-sm">Gráfico híbrido no disponible en esta versión</p>
    </div>
  );
};

// Componente específico: Price Scatter + Line Overlay
interface PriceScatterProps {
  products: any[];
  competitors: string[];
  xCompetitor?: string;
  yCompetitor?: string;
}

export const PriceScatterChart: React.FC<PriceScatterProps> = ({
  products,
  competitors,
  xCompetitor,
  yCompetitor
}) => {
  const scatterData = useMemo(() => {
    return products
      .filter(p => {
        const xPrice = p.precios?.[xCompetitor || competitors[0]];
        const yPrice = p.precios?.[yCompetitor || competitors[1]];
        return xPrice && xPrice > 0 && yPrice && yPrice > 0;
      })
      .map(p => ({
        x: p.precios?.[xCompetitor || competitors[0]] || 0,
        y: p.precios?.[yCompetitor || competitors[1]] || 0,
        name: p.nombre || p.codigo,
        codigo: p.codigo
      }));
  }, [products, competitors, xCompetitor, yCompetitor]);

  const layers: LayerConfig[] = [
    {
      type: 'scatter',
      data: scatterData,
      xKey: 'x',
      yKey: 'y',
      color: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563EB',
      opacity: 0.7
    },
    {
      type: 'line',
      data: [{ x: 0, y: 0 }, { x: 1000, y: 1000 }],
      xKey: 'x',
      yKey: 'y',
      color: getComputedStyle(document.documentElement).getPropertyValue('--color-danger').trim() || '#DC2626',
      opacity: 0.5
    }
  ];

  return (
    <HybridChart
      layers={layers}
      title="Comparación de Precios (Scatter)"
      aria-label="Gráfico de dispersión comparando precios entre competidores"
    />
  );
};

export default HybridChart;
