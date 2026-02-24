/**
 * ChartA11y - Accesibilidad avanzada para gráficos
 * ARIA live regions + descripciones dinámicas + modo alto contraste
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';

interface ChartA11yConfig {
  chartId: string;
  chartType: 'pie' | 'bar' | 'line' | 'scatter' | 'table';
  data: unknown[];
  labels?: string[];
  description?: string;
}

interface A11yState {
  isHighContrast: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
  reduceMotion: boolean;
  announceUpdates: boolean;
}

// Palette WCAG AAA para alto contraste
const HIGH_CONTRAST_PALETTE = {
  primary: '#000000',
  secondary: 'var(--color-grey-800)',
  success: '#006400',
  danger: '#8B0000',
  warning: '#8B7500',
  background: 'var(--color-bg-secondary)',
  text: '#000000',
  border: '#000000'
};

const NORMAL_PALETTE = {
  primary: '#2563EB',
  secondary: '#059669',
  success: '#10B981',
  danger: '#DC2626',
  warning: '#F59E0B',
  background: '#F1F5F9',
  text: '#0F172A',
  border: '#64748B'
};

const FONT_SIZE_MULTIPLIERS = {
  normal: 1,
  large: 1.25,
  'x-large': 1.5
};

// Hook de accesibilidad
export function useChartAccessibility(config: ChartA11yConfig) {
  const [a11yState, setA11yState] = useState<A11yState>({
    isHighContrast: false,
    fontSize: 'normal',
    reduceMotion: false,
    announceUpdates: true
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    
    setA11yState({
      reduceMotion: prefersReducedMotion,
      isHighContrast: prefersHighContrast,
      fontSize: 'normal',
      announceUpdates: true
    });
  }, []);

  const accessibleDescription = useMemo(() => {
    if (config.description) return config.description;

    const typeLabels: Record<string, string> = {
      pie: 'gráfico circular',
      bar: 'gráfico de barras',
      line: 'gráfico de líneas',
      scatter: 'gráfico de dispersión',
      table: 'tabla de datos'
    };

    const dataSummary = config.data.slice(0, 5).map((item, index) => {
      const label = config.labels?.[index] || `Elemento ${index + 1}`;
      const value = typeof item === 'object' ? JSON.stringify(item) : String(item);
      return `${label}: ${value}`;
    }).join(', ');

    return `Gráfico ${typeLabels[config.chartType] || config.chartType} mostrando ${config.data.length} elementos. ${dataSummary}${config.data.length > 5 ? ' y más.' : ''}`;
  }, [config.data, config.labels, config.description, config.chartType]);

  const accessibleTable = useMemo(() => {
    return config.data.map((row, rowIndex) => {
      if (typeof row !== 'object') {
        return { id: `row-${rowIndex}`, values: [String(row)] };
      }
      return {
        id: `row-${rowIndex}`,
        values: Object.entries(row).map(([key, value]) => `${key}: ${String(value)}`)
      };
    });
  }, [config.data]);

  const colors = a11yState.isHighContrast ? HIGH_CONTRAST_PALETTE : NORMAL_PALETTE;
  const fontSizeMultiplier = FONT_SIZE_MULTIPLIERS[a11yState.fontSize];

  return {
    a11yState,
    accessibleDescription,
    accessibleTable,
    colors,
    fontSizeMultiplier,
    toggleHighContrast: () => setA11yState(prev => ({ ...prev, isHighContrast: !prev.isHighContrast })),
    setFontSize: (size: 'normal' | 'large' | 'x-large') => setA11yState(prev => ({ ...prev, fontSize: size })),
    toggleReduceMotion: () => setA11yState(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }))
  };
}

// Componente de panel de accesibilidad
interface ChartA11yPanelProps {
  chartId: string;
  description: string;
  onHighContrastChange?: (enabled: boolean) => void;
  onFontSizeChange?: (size: 'normal' | 'large' | 'x-large') => void;
}

export const ChartA11yPanel: React.FC<ChartA11yPanelProps> = ({
  chartId,
  description,
  onHighContrastChange,
  onFontSizeChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="chart-a11y-panel glass-card p-4"
      role="region"
      aria-label="Opciones de accesibilidad del gráfico"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isExpanded}
        aria-controls={`${chartId}-a11y-panel`}
      >
        <span className="font-medium text-[var(--text-primary)]">
          Accesibilidad del Gráfico
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div id={`${chartId}-a11y-panel`} className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
              Descripción del Gráfico
            </h4>
            <p className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-tertiary)] rounded">
              {description}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--text-secondary)]">
              Opciones de Visualización
            </h4>

            <label className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded cursor-pointer">
              <span className="text-sm text-[var(--text-primary)]">Modo Alto Contraste</span>
              <button
                onClick={() => onHighContrastChange?.(true)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--border-primary)]"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </label>

            <div>
              <span className="text-sm text-[var(--text-secondary)] block mb-2">
                Tamaño de Fuente
              </span>
              <div className="flex gap-2">
                {(['normal', 'large', 'x-large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onFontSizeChange?.(size)}
                    className="px-3 py-1 text-sm rounded border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]"
                  >
                    {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Extra Grande'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Live Region para anuncios
interface ChartLiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export const ChartLiveRegion: React.FC<ChartLiveRegionProps> = ({
  message,
  politeness = 'polite'
}) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

// Resumen de datos para lectores de pantalla
interface ChartSummaryProps {
  data: { name: string; value: number }[];
  type: 'pie' | 'bar' | 'line';
}

export const ChartSummary: React.FC<ChartSummaryProps> = ({ data, type }) => {
  const summary = useMemo(() => {
    if (!data || data.length === 0) return 'No hay datos disponibles.';

    if (type === 'pie') {
      const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
      const items = data.map(item => 
        `${item.name}: ${((item.value || 0) / total * 100).toFixed(1)}%`
      ).join('. ');
      return `Gráfico circular con ${data.length} secciones. Total: ${total.toFixed(2)}. ${items}`;
    }
    
    if (type === 'bar') {
      const items = data.map(item => `${item.name}: ${(item.value || 0).toFixed(2)}`).join('. ');
      return `Gráfico de barras con ${data.length} categorías. ${items}`;
    }

    return `${data.length} puntos de datos.`;
  }, [data, type]);

  return (
    <div className="sr-only" aria-label="Resumen de datos del gráfico">
      {summary}
    </div>
  );
};

export { HIGH_CONTRAST_PALETTE, NORMAL_PALETTE };
