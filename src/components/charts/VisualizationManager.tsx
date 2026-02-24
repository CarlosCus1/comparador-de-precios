import React from 'react';
import { useAppStore } from '../../store/useAppStore';

interface VisualizationManagerProps {
  children: React.ReactNode;
  chartId: string;
  title: string;
  description: string;
  className?: string;
}

/**
 * Componente que gestiona la visibilidad de visualizaciones individuales
 * Se integra con el ChartControls para mostrar/ocultar según preferencias del usuario
 */
export const VisualizationManager: React.FC<VisualizationManagerProps> = ({
  children,
  chartId,
  title,
  description,
  className = ''
}) => {
  const visibleCharts = useAppStore((state) => state.visibleCharts || {});
  
  // Verificar si este gráfico está habilitado
  const isVisible = visibleCharts[chartId] !== false;

  if (!isVisible) {
    return (
      <div className={`visualization-placeholder ${className}`} aria-hidden="true">
        <div className="p-6 border-2 border-dashed border-[var(--border-secondary)] rounded-xl bg-[var(--bg-tertiary)]/50">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <h4 className="font-bold text-[var(--text-primary)]">{title}</h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">Oculto - Actívalo en Controles de Visualización</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`visualization-container ${className}`} aria-label={`Visualización: ${title}`}>
      {children}
    </div>
  );
};

/**
 * Hook para gestionar la visibilidad de gráficos
 */
export const useVisualizationVisibility = () => {
  const visibleCharts = useAppStore((state) => state.visibleCharts || {});
  const setVisibleCharts = useAppStore((state) => state.setVisibleCharts);

  const setChartVisibility = (chartId: string, visible: boolean) => {
    setVisibleCharts({
      ...visibleCharts,
      [chartId]: visible
    });
  };

  const resetToDefaults = () => {
    setVisibleCharts({
      'dashboard-kpis': true,
      'price-distribution': true,
      'price-trends': true,
      'drill-down': true,
      'hybrid-visualization': true,
      'price-averages': true,
      'line-counters': true,
      'real-time-streaming': false
    });
  };

  return {
    visibleCharts,
    setChartVisibility,
    resetToDefaults
  };
};

/**
 * Componente de ejemplo que muestra cómo se integraría en el dashboard
 */
export const DashboardWithVisibility: React.FC = () => {
  const { visibleCharts } = useVisualizationVisibility();

  return (
    <div className="space-y-6">
      {/* KPIs del Dashboard */}
      <VisualizationManager
        chartId="dashboard-kpis"
        title="KPIs del Dashboard"
        description="Indicadores clave de desempeño"
      >
        <div className="glass-card p-4">
          <h3 className="text-lg font-bold mb-4">KPIs del Dashboard</h3>
          {/* Contenido del gráfico de KPIs */}
        </div>
      </VisualizationManager>

      {/* Distribución de Precios */}
      <VisualizationManager
        chartId="price-distribution"
        title="Distribución de Precios"
        description="Gráfico circular de distribución"
      >
        <div className="glass-card p-4">
          <h3 className="text-lg font-bold mb-4">Distribución de Precios</h3>
          {/* Contenido del gráfico de distribución */}
        </div>
      </VisualizationManager>

      {/* Tendencias de Precios */}
      <VisualizationManager
        chartId="price-trends"
        title="Tendencias de Precios"
        description="Análisis de tendencias temporales"
      >
        <div className="glass-card p-4">
          <h3 className="text-lg font-bold mb-4">Tendencias de Precios</h3>
          {/* Contenido del gráfico de tendencias */}
        </div>
      </VisualizationManager>

      {/* Contador de visualizaciones activas */}
      <div className="text-sm text-[var(--text-secondary)]">
        Visualizaciones activas: {Object.values(visibleCharts).filter(Boolean).length} / {Object.keys(visibleCharts).length}
      </div>
    </div>
  );
};

export default VisualizationManager;