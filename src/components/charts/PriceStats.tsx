import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Calculator,
  List,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
} from 'lucide-react';

interface PriceStatsProps {
  className?: string;
}

export const PriceStats: React.FC<PriceStatsProps> = ({ className = '' }) => {
  const lista = useAppStore((state) => state.listas.precios);

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

    const maxLinea = Object.entries(lineas).reduce((a, b) => a[1] > b[1] ? a : b);
    const minLinea = Object.entries(lineas).reduce((a, b) => a[1] < b[1] ? a : b);

    const variacionPrecios = preciosSugeridos.length > 1
      ? Math.max(...preciosSugeridos) - Math.min(...preciosSugeridos)
      : 0;

    return {
      totalProductos,
      promedioPreciosSugeridos,
      lineas,
      totalLineas: Object.keys(lineas).length,
      lineaMasUsada: maxLinea[0],
      lineaMenosUsada: minLinea[0],
      variacionPrecios,
      maxPrecio: preciosSugeridos.length > 0 ? Math.max(...preciosSugeridos) : 0,
      minPrecio: preciosSugeridos.length > 0 ? Math.min(...preciosSugeridos) : 0
    };
  }, [lista]);

  const getVariationColor = (variacion: number) => {
    if (variacion === 0) return 'text-[var(--text-secondary)]';
    return variacion > 100 ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]';
  };

  const getVariationIcon = (variacion: number) => {
    if (variacion === 0) return <Calculator className="w-4 h-4" />;
    return variacion > 100 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
  };

  const getVariationBadge = (variacion: number) => {
    if (variacion === 0) return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]';
    return variacion > 100 ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]' : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Productos */}
      <div className="glass-card p-4 border-l-4 border-[var(--color-comparador-primary)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Total Productos</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalProductos}</div>
          </div>
          <div className="p-3 bg-[var(--color-comparador-primary)]/10 rounded-full">
            <Package className="w-6 h-6 text-[var(--color-comparador-primary)]" />
          </div>
        </div>
      </div>

      {/* Promedio de Precios Sugeridos */}
      <div className="glass-card p-4 border-l-4 border-[var(--color-pedido-primary)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Promedio Sugerido</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              S/. {stats.promedioPreciosSugeridos.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-[var(--color-pedido-primary)]/10 rounded-full">
            <DollarSign className="w-6 h-6 text-[var(--color-pedido-primary)]" />
          </div>
        </div>
      </div>

      {/* Total Líneas */}
      <div className="glass-card p-4 border-l-4 border-[var(--color-inventario-primary)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Total Líneas</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalLineas}</div>
          </div>
          <div className="p-3 bg-[var(--color-inventario-primary)]/10 rounded-full">
            <List className="w-6 h-6 text-[var(--color-inventario-primary)]" />
          </div>
        </div>
      </div>

      {/* Variación de Precios */}
      <div className="glass-card p-4 border-l-4 border-[var(--color-devoluciones-primary)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Variación de Precios</div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getVariationColor(stats.variacionPrecios)}`}>
                S/. {stats.variacionPrecios.toFixed(2)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariationBadge(stats.variacionPrecios)}`}>
                {stats.variacionPrecios > 100 ? 'Alta' : stats.variacionPrecios > 0 ? 'Moderada' : 'Sin variación'}
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              Rango: S/. {stats.minPrecio.toFixed(2)} - S/. {stats.maxPrecio.toFixed(2)}
            </div>
          </div>
          <div className={`p-3 ${getVariationColor(stats.variacionPrecios).replace('text-', 'bg-')}/10 rounded-full`}>
            {getVariationIcon(stats.variacionPrecios)}
          </div>
        </div>
      </div>

      {/* Línea Más Usada */}
      {stats.totalLineas > 0 && (
        <div className="glass-card p-4 border-l-4 border-[var(--color-comparador-surface)] col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--text-secondary)]">Línea Más Usada</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{stats.lineaMasUsada}</div>
              <div className="text-sm text-[var(--text-secondary)]">
                {stats.lineas[stats.lineaMasUsada]} productos
              </div>
            </div>
            <div className="p-3 bg-[var(--color-comparador-surface)]/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-[var(--color-comparador-surface)]" />
            </div>
          </div>
        </div>
      )}

      {/* Línea Menos Usada */}
      {stats.totalLineas > 1 && (
        <div className="glass-card p-4 border-l-4 border-[var(--color-devoluciones-surface)] col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--text-secondary)]">Línea Menos Usada</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{stats.lineaMenosUsada}</div>
              <div className="text-sm text-[var(--text-secondary)]">
                {stats.lineas[stats.lineaMenosUsada]} productos
              </div>
            </div>
            <div className="p-3 bg-[var(--color-devoluciones-surface)]/10 rounded-full">
              <TrendingDown className="w-6 h-6 text-[var(--color-devoluciones-surface)]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};