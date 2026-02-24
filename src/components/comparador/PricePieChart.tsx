/**
 * PricePieChart - Gráfico circular interactivo mejorado
 * Con accesibilidad, tooltips enriquecidos y sincronización
 */
import React, { useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PricePieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
    details?: Record<string, unknown>;
  }>;
  title?: string;
  ariaLabel?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  synchronized?: boolean;
  onSegmentClick?: (data: { name: string; value: number }) => void;
  onHover?: (data: { name: string; value: number } | null) => void;
}

// Colores WCAG AAA usando variables CSS
const getColors = () => [
  getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563EB',
  getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#059669',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#7C3AED',
  getComputedStyle(document.documentElement).getPropertyValue('--color-danger').trim() || '#DC2626',
  getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim() || '#F59E0B',
  getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim() || '#10B981',
  getComputedStyle(document.documentElement).getPropertyValue('--color-error').trim() || '#EF4444',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#8B5CF6'
];

const getHoverColors = () => [
  getComputedStyle(document.documentElement).getPropertyValue('--color-primary-700').trim() || '#1E40AF',
  getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-700').trim() || '#047857',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent-700').trim() || '#6D28D9',
  getComputedStyle(document.documentElement).getPropertyValue('--color-danger-700').trim() || '#B91C1C',
  getComputedStyle(document.documentElement).getPropertyValue('--color-warning-700').trim() || '#D97706',
  getComputedStyle(document.documentElement).getPropertyValue('--color-success-700').trim() || '#059669',
  getComputedStyle(document.documentElement).getPropertyValue('--color-error-700').trim() || '#DC2626',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent-700').trim() || '#7C3AED'
];

// Tooltip personalizado enriquecido
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: {
      name: string;
      value: number;
      details?: Record<string, unknown>;
      percent?: number;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload.reduce((sum, item) => sum + item.value, 0);
    const percent = total > 0 ? ((data.value / total) * 100).toFixed(2) : '0';
    
    return (
      <div 
        className="glass p-4 rounded-lg border border-[var(--border-primary)] shadow-lg"
        role="tooltip"
        aria-live="polite"
      >
        <p className="font-bold text-[var(--text-primary)]">{data.name}</p>
        <p className="text-[var(--color-comparador-primary)] font-bold text-lg">
          S/ {data.value.toFixed(2)}
        </p>
        <p className="text-[var(--text-secondary)] text-sm">
          {percent}% del total
        </p>
        {data.payload.details && (
          <div className="mt-2 pt-2 border-t border-[var(--border-primary)]">
            {Object.entries(data.payload.details).map(([key, value]) => (
              <p key={key} className="text-xs text-[var(--text-tertiary)]">
                {key}: {String(value)}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const PricePieChart: React.FC<PricePieChartProps> = ({
  data,
  title,
  ariaLabel,
  showLegend = true,
  showTooltip = true,
  synchronized = false,
  onSegmentClick,
  onHover
}) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Calcular total y porcentajes
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  // Datos con porcentajes calculados
  const chartData = useMemo(() => 
    data.map((item, index) => ({
      ...item,
      percent: total > 0 ? (item.value / total) : 0,
      color: item.color || getColors()[index % getColors().length],
      hoverColor: getHoverColors()[index % getHoverColors().length]
    })), [data, total]
  );

  // Manejar click en segmento
  type SegmentEntry = { name: string; value: number; percent?: number };

  const handleSegmentClick = useCallback((entry: SegmentEntry) => {
    setActiveSegment(entry.name);
    onSegmentClick?.({ name: entry.name, value: entry.value });
  }, [onSegmentClick]);

  // Manejar hover
  const handleMouseEnter = useCallback((entry: SegmentEntry) => {
    setHoveredSegment(entry.name);
    onHover?.({ name: entry.name, value: entry.value });
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    setHoveredSegment(null);
    onHover?.(null);
  }, [onHover]);

  // Generar descripción accesible
  const accessibleDescription = useMemo(() => {
    const segments = chartData
      .map(item => `${item.name}: S/ ${item.value.toFixed(2)} (${(item.percent * 100).toFixed(2)}%)`)
      .join(', ');
    return `Gráfico circular mostrando distribución de precios. ${segments}. Total: S/ ${total.toFixed(2)}`;
  }, [chartData, total]);

  return (
    <div className="w-full" role="img" aria-label={ariaLabel || title || 'Gráfico circular de precios'}>
      {title && <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">{title}</h3>}
      
      {/* Descripción accesible para lectores de pantalla */}
      <div className="sr-only" aria-live="polite">
        {accessibleDescription}
      </div>

      {/* Resumen textual alternativo */}
      <div className="sr-only" aria-label="Tabla de datos accesibles">
        <table>
          <caption>Datos del gráfico circular</caption>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Valor (S/)</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.value.toFixed(2)}</td>
                <td>{(item.percent * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{total.toFixed(2)}</td>
              <td>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) => 
                `${name || ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              outerRadius={80}
              dataKey="value"
              onClick={handleSegmentClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              role="graphics-symbol"
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="var(--border-primary)"
                  strokeWidth={1}
                  style={{
                    opacity: hoveredSegment && hoveredSegment !== entry.name ? 0.5 : 1,
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                    transform: hoveredSegment === entry.name ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip content={<CustomTooltip />} />
            )}
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Indicador de segmento activo */}
      {activeSegment && (
        <div 
          className="mt-2 p-2 bg-[var(--color-success)]/10 rounded text-sm text-[var(--color-success)]"
          role="status"
          aria-live="polite"
        >
          Seleccionado: {activeSegment}
        </div>
      )}
    </div>
  );
};

export default PricePieChart;
