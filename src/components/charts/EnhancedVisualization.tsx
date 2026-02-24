import React, { useState, useCallback, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { useToast } from '../../contexts/ToastContext';

interface VisualizationControl {
  id: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface EnhancedVisualizationProps {
  title: string;
  children: React.ReactNode;
  onExport?: (format: 'png' | 'svg' | 'json') => void;
  onReset?: () => void;
  controls?: VisualizationControl[];
  className?: string;
  ariaLabel?: string;
}

export const EnhancedVisualization: React.FC<EnhancedVisualizationProps> = ({
  title,
  children,
  onExport,
  onReset,
  controls = [],
  className = '',
  ariaLabel = 'Visualización interactiva'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const defaultControls: VisualizationControl[] = [
    { id: 'zoom', label: 'Zoom', icon: <ZoomIn className="w-4 h-4" />, enabled: true },
    { id: 'export', label: 'Exportar', icon: <Download className="w-4 h-4" />, enabled: true },
    { id: 'reset', label: 'Resetear', icon: <RefreshCw className="w-4 h-4" />, enabled: true },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" />, enabled: true }
  ];

  const availableControls = controls.length > 0 ? controls : defaultControls;

  const handleExport = useCallback((format: 'png' | 'svg' | 'json') => {
    if (onExport) {
      onExport(format);
      addToast(`Exportando visualización a ${format.toUpperCase()}...`, 'info');
    } else {
      addToast('Función de exportación no disponible', 'warning');
    }
  }, [onExport, addToast]);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const step = 10;
    const newZoom = direction === 'in' 
      ? Math.min(200, zoomLevel + step)
      : Math.max(50, zoomLevel - step);
    
    setZoomLevel(newZoom);
    addToast(`Zoom: ${newZoom}%`, 'info');
  }, [zoomLevel, addToast]);

  const handleReset = useCallback(() => {
    setZoomLevel(100);
    setIsFullscreen(false);
    onReset?.();
    addToast('Visualización restablecida', 'success');
  }, [onReset, addToast]);

  return (
    <div 
      ref={containerRef}
      className={`enhanced-visualization glass-card p-4 ${className}`}
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
      aria-label={ariaLabel}
    >
      {/* Barra de controles superior */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        
        <div className="flex items-center gap-2">
          {/* Controles de zoom */}
          <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
            <Tooltip content="Alejar" position="top">
              <button
                onClick={() => handleZoom('out')}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Alejar visualización"
              >
                <ZoomOut className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </Tooltip>
            
            <span className="px-2 text-sm text-[var(--text-secondary)] min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            
            <Tooltip content="Acercar" position="top">
              <button
                onClick={() => handleZoom('in')}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Acercar visualización"
              >
                <ZoomIn className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </Tooltip>
          </div>

          {/* Controles principales */}
          <div className="flex items-center gap-1">
            {availableControls.map(control => (
              <Tooltip key={control.id} content={control.label} position="top">
                <button
                  onClick={() => {
                    switch(control.id) {
                      case 'export':
                        handleExport('png');
                        break;
                      case 'reset':
                        handleReset();
                        break;
                      case 'settings':
                        setIsSettingsOpen(!isSettingsOpen);
                        break;
                      default:
                        break;
                    }
                  }}
                  className="p-2 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                  aria-label={control.label}
                >
                  {control.icon}
                </button>
              </Tooltip>
            ))}

            {/* Botón de pantalla completa */}
            <Tooltip content={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"} position="top">
              <button
                onClick={handleFullscreen}
                className={`p-2 rounded-lg border transition-all ${
                  isFullscreen 
                    ? 'bg-[var(--color-comparador-primary)]/10 border-[var(--color-comparador-primary)] text-[var(--color-comparador-primary)]' 
                    : 'border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Contenido de la visualización */}
      <div className="relative">
        {children}
        
        {/* Overlay de estado */}
        {(zoomLevel !== 100 || isFullscreen) && (
          <div className="absolute top-2 right-2 flex gap-1">
            {zoomLevel !== 100 && (
              <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded-lg text-xs text-[var(--text-secondary)] border border-[var(--border-primary)]">
                Zoom: {zoomLevel}%
              </span>
            )}
            {isFullscreen && (
              <span className="px-2 py-1 bg-[var(--color-comparador-primary)]/10 rounded-lg text-xs text-[var(--color-comparador-primary)] border border-[var(--color-comparador-primary)]/50">
                Pantalla completa
              </span>
            )}
          </div>
        )}
      </div>

      {/* Panel de configuración */}
      {isSettingsOpen && (
        <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[var(--text-primary)]">Configuración Avanzada</h4>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 rounded hover:bg-[var(--bg-secondary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="text-sm text-[var(--text-secondary)]">Mostrar tooltips</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="text-sm text-[var(--text-secondary)]">Animaciones suaves</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-[var(--text-secondary)]">Modo alto contraste</span>
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="text-sm text-[var(--text-secondary)]">Exportación automática</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-[var(--text-secondary)]">Accesibilidad mejorada</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-[var(--text-secondary)]">Caché de datos</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-3 py-1 border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                setIsSettingsOpen(false);
                addToast('Configuración guardada', 'success');
              }}
              className="px-3 py-1 bg-[var(--color-comparador-primary)] text-white rounded-lg hover:bg-[var(--color-comparador-dark)]"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de carga */}
      <div className="sr-only" aria-live="polite">
        Visualización cargada y lista para interactuar
      </div>
    </div>
  );
};

// Componente de mini-dashboard para insights rápidos
interface QuickInsight {
  title: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

interface QuickInsightsProps {
  insights: QuickInsight[];
  title?: string;
  className?: string;
}

export const QuickInsights: React.FC<QuickInsightsProps> = ({
  insights,
  title = 'Resumen Ejecutivo',
  className = ''
}) => {
  return (
    <div className={`quick-insights glass-card p-4 ${className}`}>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-[var(--border-primary)] hover:border-[var(--color-comparador-primary)] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">{insight.title}</span>
              {insight.trend && (
                <span className={`p-1 rounded ${insight.trend === 'up' ? 'bg-success-100 text-success-800' : insight.trend === 'down' ? 'bg-error-100 text-error-800' : 'bg-grey-100 text-grey-800'}`}>
                  {insight.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : insight.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                </span>
              )}
            </div>
            
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]" style={{ color: insight.color }}>
                {insight.value}
              </span>
              {insight.change !== undefined && (
                <span className={`text-sm font-medium ${insight.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insight.change >= 0 ? '+' : ''}{insight.change.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de comparación de escenarios
interface ScenarioComparisonProps {
  scenarios: {
    name: string;
    data: { label: string; value: number; color?: string }[];
    total: number;
  }[];
  title?: string;
  className?: string;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  title = 'Comparación de Escenarios',
  className = ''
}) => {
  return (
    <div className={`scenario-comparison glass-card p-4 ${className}`}>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[var(--text-primary)]">{scenario.name}</h4>
              <span className="text-lg font-bold text-[var(--color-comparador-primary)]">
                S/ {scenario.total.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2">
              {scenario.data.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || getComputedStyle(document.documentElement).getPropertyValue(`--color-primary-${(itemIndex % 9) * 100 + 100}`).trim() || `hsl(${itemIndex * 60}, 70%, 50%)` }}
                    />
                    <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">
                    S/ {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedVisualization;