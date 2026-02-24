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
  layers,
  synchronized = true,
  onSelectionChange,
  onHover,
  title = 'Visualización Híbrida',
  ariaLabel = 'Gráfico híbrido con múltiples capas de datos'
}) => {
  const [chartState, setChartState] = useState<ChartState>({
    activeLayers: layers.map((_, i) => `layer-${i}`),
    selectedPoint: null,
    hoveredPoint: null
  });

  // Sincronizar hover entre gráficos
  React.useEffect(() => {
    if (!synchronized || !chartState.hoveredPoint) return;
    onHover?.(chartState.hoveredPoint);
  }, [chartState.hoveredPoint, synchronized, onHover]);

  // Manejar selección de punto
  const handlePointClick = useCallback((data: unknown) => {
    setChartState(prev => ({
      ...prev,
      selectedPoint: data
    }));
    onSelectionChange?.(data);
  }, [onSelectionChange]);

  // Manejar hover
  const handleHover = useCallback((data: unknown) => {
    setChartState(prev => ({
      ...prev,
      hoveredPoint: data
    }));
    onHover?.(data);
  }, [onHover]);

  // Toggle layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setChartState(prev => ({
      ...prev,
      activeLayers: prev.activeLayers.includes(layerId)
        ? prev.activeLayers.filter(id => id !== layerId)
        : [...prev.activeLayers, layerId]
    }));
  }, []);

  // Descripción accesible
  const accessibleDescription = useMemo(() => {
    const activeLayerNames = layers
      .filter((_, i) => chartState.activeLayers.includes(`layer-${i}`))
      .map(l => l.type)
      .join(', ');
    return `${title}. Capas activas: ${activeLayerNames}.`;
  }, [layers, chartState.activeLayers, title]);

  return (
    <div 
      className="hybrid-chart glass-card p-4"
      role="application"
      aria-label={ariaLabel}
    >
      {/* Encabezado con controles de capas */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        
        {/* Controles de capas */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Control de capas">
          {layers.map((layer, index) => {
            const layerId = `layer-${index}`;
            const isActive = chartState.activeLayers.includes(layerId);
            
            return (
              <button
                key={layerId}
                onClick={() => toggleLayer(layerId)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  isActive 
                    ? 'bg-[var(--color-comparador-primary)] text-white border-[var(--color-comparador-primary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)] opacity-60'
                }`}
                aria-pressed={isActive}
              >
                {layer.type} {isActive ? '✓' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Descripción accesible */}
      <div className="sr-only" aria-live="polite">
        {accessibleDescription}
      </div>

      {/* Contenedor del gráfico */}
      <div style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            onClick={handlePointClick as any}
            onMouseMove={handleHover as any}
            role="img"
            aria-label={accessibleDescription}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
            <XAxis 
              dataKey={layers[0]?.xKey || 'x'} 
              type="number"
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--border-primary)' }}
              label={{ 
                value: layers[0]?.xKey || 'Eje X', 
                position: 'bottom', 
                fill: 'var(--text-secondary)' 
              }}
            />
            <YAxis 
              dataKey={layers[0]?.yKey || 'y'}
              type="number"
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--border-primary)' }}
              label={{ 
                value: layers[0]?.yKey || 'Eje Y', 
                angle: -90, 
                position: 'left',
                fill: 'var(--text-secondary)' 
              }}
            />
            <ZAxis range={[60, 400]} name={layers[0]?.zKey || 'Size'} />
            <RechartsTooltip
              contentStyle={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
              formatter={(value: number | undefined) => [
                `S/ ${(value ?? 0).toFixed(2)}`,
                'Precio'
              ]}
            />
            <Legend />

            {/* Renderizar capas activas */}
            {layers.map((layer, index) => {
              const layerId = `layer-${index}`;
              if (!chartState.activeLayers.includes(layerId)) return null;

              if (layer.type === 'scatter') {
                return (
                  <Scatter
                    key={layerId}
                    name={`scatter-${index}`}
                    data={layer.data}
                    fill={layer.color || getScatterColors()[index % getScatterColors().length]}
                    opacity={layer.opacity ?? 0.7}
                  />
                );
              }
              if (layer.type === 'bar') {
                return (
                  <Bar
                    key={layerId}
                    name={`bar-${index}`}
                    dataKey={layer.dataKey || 'value'}
                    fill={layer.color || getScatterColors()[index % getScatterColors().length]}
                    opacity={layer.opacity ?? 0.7}
                  />
                );
              }
              if (layer.type === 'line') {
                return (
                  <Line
                    key={layerId}
                    name={`line-${index}`}
                    type="monotone"
                    dataKey={layer.dataKey || 'value'}
                    stroke={layer.color || getScatterColors()[index % getScatterColors().length]}
                    strokeWidth={2}
                  />
                );
              }
              return null;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Panel de detalles del punto seleccionado */}
      {chartState.selectedPoint && (
        <div 
          className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--color-comparador-primary)]"
          role="region"
          aria-label="Detalles del punto seleccionado"
        >
          <h4 className="font-bold text-[var(--color-comparador-primary)] mb-2">
            Datos Seleccionados
          </h4>
          <button
            onClick={() => {
              setChartState(prev => ({ ...prev, selectedPoint: null }));
              onSelectionChange?.(null);
            }}
            className="text-sm text-[var(--color-danger)] hover:underline"
          >
            Deseleccionar
          </button>
        </div>
      )}

      {/* Leyenda adicional para accesibilidad */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm" role="list" aria-label="Leyenda del gráfico">
        {layers.map((layer, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2"
            role="listitem"
          >
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: layer.color || getScatterColors()[index % getScatterColors().length] }}
              aria-hidden="true"
            />
            <span className="text-[var(--text-secondary)]">{layer.type}</span>
          </div>
        ))}
      </div>
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
