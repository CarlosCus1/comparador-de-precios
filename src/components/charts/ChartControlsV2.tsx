import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TrendingUp as TrendingUpIcon,
  Save,
  RotateCcw,
  HardDriveDownload,
  HardDriveUpload
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../contexts/ToastContext';

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

const STORAGE_KEY = 'chart_visibility_config';

interface ChartConfig {
  charts: Record<string, boolean>;
  lastModified: string;
  version: string;
}

export const ChartControlsV2: React.FC<ChartControlsProps> = ({
  onChartVisibilityChange,
  currentCharts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCharts, setLocalCharts] = useState<Record<string, boolean>>(currentCharts);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  
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

  // Cargar configuración desde localStorage
  const loadConfig = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config: ChartConfig = JSON.parse(saved);
        // Validar que la configuración sea válida
        const isValid = CHART_CONTROLS.every(chart => 
          typeof config.charts[chart.id] === 'boolean'
        );
        
        if (isValid) {
          setLocalCharts(config.charts);
          addToast(`Configuración cargada: ${Object.values(config.charts).filter(Boolean).length} gráficos activos`, 'success');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading chart config:', error);
      addToast('Error al cargar configuración guardada', 'error');
    }
    
    // Si no hay configuración guardada o es inválida, usar la actual
    setLocalCharts(currentCharts);
  }, [currentCharts, addToast]);

  // Guardar configuración en localStorage
  const saveConfig = useCallback(async () => {
    setIsSaving(true);
    try {
      const config: ChartConfig = {
        charts: localCharts,
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      addToast('Configuración guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving chart config:', error);
      addToast('Error al guardar configuración', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [localCharts, addToast]);

  // Restablecer a valores por defecto
  const resetToDefaults = useCallback(() => {
    const defaultCharts = CHART_CONTROLS.reduce((acc, chart) => {
      acc[chart.id] = chart.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    setLocalCharts(defaultCharts);
    addToast('Configuración restablecida a valores por defecto', 'info');
  }, [addToast]);

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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

  const exportConfig = () => {
    const config: ChartConfig = {
      charts: localCharts,
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('Configuración exportada exitosamente', 'success');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config: ChartConfig = JSON.parse(e.target?.result as string);
        
        // Validar la configuración importada
        const isValid = CHART_CONTROLS.every(chart => 
          typeof config.charts[chart.id] === 'boolean'
        );
        
        if (isValid) {
          setLocalCharts(config.charts);
          addToast(`Configuración importada: ${Object.values(config.charts).filter(Boolean).length} gráficos activos`, 'success');
        } else {
          addToast('Archivo de configuración inválido', 'error');
        }
      } catch (error) {
        console.error('Error importing chart config:', error);
        addToast('Error al importar configuración', 'error');
      } finally {
        setIsLoading(false);
        // Limpiar el input file
        event.target.value = '';
      }
    };
    reader.readAsText(file);
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

      {/* Controles Avanzados */}
      <div className="border-t border-[var(--border-primary)] pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[var(--text-primary)]">Gestión de Configuración</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>
          
          <button
            onClick={loadConfig}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">{isLoading ? 'Cargando...' : 'Cargar'}</span>
          </button>
          
          <button
            onClick={exportConfig}
            className="flex items-center gap-2 px-3 py-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <HardDriveDownload className="w-4 h-4" />
            <span className="text-sm">Exportar</span>
          </button>
          
          <label className="flex items-center gap-2 px-3 py-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
            <HardDriveUpload className="w-4 h-4" />
            <span className="text-sm">Importar</span>
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-primary)]">
        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          <span>{Object.values(localCharts).filter(Boolean).length} gráficos activos</span>
          <span className="text-xs">Último guardado: {new Date().toLocaleTimeString()}</span>
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

export default ChartControlsV2;