import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Eye,
  EyeOff,
  Settings,
  Database,
  Zap,
  Calculator,
  List,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { useAppStore } from '../../store/useAppStore';

interface ChartControl {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  order: number;
}

interface ChartControlsProps {
  onChartVisibilityChange: (charts: Record<string, boolean>) => void;
  currentCharts: Record<string, boolean>;
}

const CHART_CONTROLS: ChartControl[] = [
  {
    id: 'dashboard-kpis',
    label: 'KPIs del Dashboard',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Indicadores clave de desempeño',
    enabled: true,
    order: 1
  },
  {
    id: 'price-distribution',
    label: 'Distribución de Precios',
    icon: <PieChartIcon className="w-4 h-4" />,
    description: 'Gráfico circular de distribución',
    enabled: true,
    order: 2
  },
  {
    id: 'price-trends',
    label: 'Tendencias de Precios',
    icon: <TrendingUpIcon className="w-4 h-4" />,
    description: 'Análisis de tendencias temporales',
    enabled: true,
    order: 3
  },
  {
    id: 'drill-down',
    label: 'Drill-Down Jerárquico',
    icon: <Layers className="w-4 h-4" />,
    description: 'Navegación jerárquica',
    enabled: true,
    order: 4
  },
  {
    id: 'hybrid-visualization',
    label: 'Visualización Híbrida',
    icon: <Database className="w-4 h-4" />,
    description: 'Superposición de capas',
    enabled: true,
    order: 5
  },
  {
    id: 'price-averages',
    label: 'Media de Precios Sugeridos',
    icon: <Calculator className="w-4 h-4" />,
    description: 'Promedio de precios sugeridos',
    enabled: true,
    order: 6
  },
  {
    id: 'line-counters',
    label: 'Contador de Líneas',
    icon: <List className="w-4 h-4" />,
    description: 'Conteo por categorías',
    enabled: true,
    order: 7
  },
  {
    id: 'real-time-streaming',
    label: 'Streaming en Tiempo Real',
    icon: <Zap className="w-4 h-4" />,
    description: 'Datos en tiempo real',
    enabled: false,
    order: 8
  }
];

export const ChartControls: React.FC<ChartControlsProps> = ({
  onChartVisibilityChange,
  currentCharts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCharts, setLocalCharts] = useState<Record<string, boolean>>(currentCharts);

  const lista = useAppStore((state) => state.listas.precios);

  // Calcular estadísticas para los nuevos controles
  const stats = useMemo(() => {
    const preciosSugeridos = lista
      .map(p => p.precio_sugerido)
      .filter(p => p !== null && p !== undefined && p > 0) as number[];

    const lineas = lista.reduce((acc, p) => {
      const linea = p.linea || 'Sin línea';
      acc[linea] = (acc[linea] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalProductos = lista.length;
    const promedioPreciosSugeridos = preciosSugeridos.length > 0
      ? preciosSugeridos.reduce((sum, p) => sum + p, 0) / preciosSugeridos.length
      : 0;

    return {
      totalProductos,
      promedioPreciosSugeridos,
      lineas,
      totalLineas: Object.keys(lineas).length
    };
  }, [lista]);


  // Sincronizar cambios locales con el padre
  useEffect(() => {
    onChartVisibilityChange(localCharts);
  }, [localCharts, onChartVisibilityChange]);

  const toggleChart = (chartId: string) => {
    setLocalCharts(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }));
  };

  const resetToDefaults = () => {
    setLocalCharts(CHART_CONTROLS.reduce((acc, chart) => {
      acc[chart.id] = chart.enabled;
      return acc;
    }, {} as Record<string, boolean>));
  };

  return (
    <div className="glass-card p-4 space-y-4" role="region" aria-label="Controles de visualización de gráficos">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[var(--color-comparador-primary)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Controles de Visualización</h3>
          <Tooltip content="Personaliza qué gráficos se muestran" position="top">
            <button className="p-1 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors">
              <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip content={isExpanded ? "Contraer controles" : "Expandir controles"} position="top">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200"
              aria-label={isExpanded ? "Contraer controles" : "Expandir controles"}
            >
              <Settings className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center">
          <div className="text-sm text-[var(--text-secondary)]">Total Productos</div>
          <div className="text-2xl font-bold text-[var(--color-comparador-primary)]">{stats.totalProductos}</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-sm text-[var(--text-secondary)]">Promedio Sugerido</div>
          <div className="text-2xl font-bold text-[var(--color-pedido-primary)]">S/. {stats.promedioPreciosSugeridos.toFixed(2)}</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-sm text-[var(--text-secondary)]">Total Líneas</div>
          <div className="text-2xl font-bold text-[var(--color-inventario-primary)]">{stats.totalLineas}</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-sm text-[var(--text-secondary)]">Línea Más Usada</div>
          <div className="text-lg font-bold text-[var(--color-devoluciones-primary)]">
            {Object.keys(stats.lineas).length > 0 
              ? Object.entries(stats.lineas).reduce((a, b) => a[1] > b[1] ? a : b)[0]
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Controles de Gráficos */}
      <div className={`space-y-2 ${isExpanded ? 'block' : 'hidden'}`}>
        {CHART_CONTROLS.map((chart) => (
          <div
            key={chart.id}
            className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                {chart.icon}
              </div>
              <div>
                <div className="font-medium text-[var(--text-primary)]">{chart.label}</div>
                <div className="text-sm text-[var(--text-secondary)]">{chart.description}</div>
              </div>
            </div>
            <button
              onClick={() => toggleChart(chart.id)}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                localCharts[chart.id]
                  ? 'border-[var(--color-comparador-primary)] bg-[var(--color-comparador-primary)]/10 text-[var(--color-comparador-primary)]'
                  : 'border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
              aria-label={`Mostrar/Ocultar ${chart.label}`}
            >
              {localCharts[chart.id] ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-primary)]">
        <div className="text-sm text-[var(--text-secondary)]">
          {Object.values(localCharts).filter(Boolean).length} gráficos activos
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 text-sm border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Restablecer
          </button>
          
          <Tooltip content="Aplicar cambios y actualizar vista" position="top">
            <button
              onClick={() => onChartVisibilityChange(localCharts)}
              className="px-4 py-1.5 bg-[var(--color-comparador-primary)] text-white rounded-lg hover:bg-[var(--color-comparador-primary)]/90 transition-colors"
            >
              Aplicar Cambios
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};