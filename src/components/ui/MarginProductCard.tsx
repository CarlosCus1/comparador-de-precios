// --------------------------------------------------------------------------- #
//                                                                             #
//              src/components/ui/MarginProductCard.tsx                        #
//           Tarjeta de producto para vista móvil responsiva                   #
//                                                                             #
// --------------------------------------------------------------------------- //

import React from 'react';
import { type MarginProduct } from '../../store/useMarginStore';
import { 
  PriceInputEnhanced, 
  ProfitDisplay 
} from '../ui/PriceInputEnhanced';
import { Tooltip } from '../ui/Tooltip';
import {
  Tag,
  Trash2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface MarginProductCardProps {
  producto: MarginProduct;
  onUpdateCampo: (campo: 'costo' | 'precio' | 'markup' | 'margen', valor: number) => void;
  onEliminar: () => void;
}

// Colores para cada tipo de campo (para consistencia visual)
const fieldColors = {
  costo: {
    label: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  precio: {
    label: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
  },
  markup: {
    label: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  margen: {
    label: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
  },
};

export const MarginProductCard: React.FC<MarginProductCardProps> = ({
  producto,
  onUpdateCampo,
  onEliminar,
}) => {
  // Determinar si mostrar advertencia
  const showWarning = producto.costo === null && producto.precio === null &&
                     (producto.markup !== null || producto.margen !== null);

  return (
    <div className="bg-[var(--surface-elevated)] rounded-xl border-2 border-[var(--border-primary)] shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header de la tarjeta - Mejorado (Ajuste 5) */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-mono font-bold text-white text-base block">
              {producto.codigo}
            </span>
          </div>
        </div>
        <button
          onClick={onEliminar}
          className="p-2.5 rounded-lg hover:bg-white/20 text-white transition-colors flex-shrink-0"
          title="Eliminar producto"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Nombre del producto - Mejorado (Ajuste 5) */}
      <div className="px-5 py-3.5 border-b-2 border-[var(--border-secondary)] bg-gradient-to-br from-[var(--bg-tertiary)]/50 to-transparent">
        <p className="text-[var(--text-primary)] font-semibold text-base leading-snug line-clamp-2" title={producto.nombre}>
          {producto.nombre}
        </p>
      </div>

      {/* Campos de precio en formato de grid - Mejorado (Ajuste 5) */}
      <div className="p-5 space-y-5">
        {/* Fila 1: Costo y Precio */}
        <div className="grid grid-cols-2 gap-4">
          {/* Costo */}
          <div className="space-y-2.5">
            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${fieldColors.costo.label}`}>
              <div className={`p-1.5 rounded-lg ${fieldColors.costo.bg} border ${fieldColors.costo.border}`}>
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span>Costo</span>
              {producto.lockedFields.includes('costo') && (
                <Tooltip content="Campo bloqueado (calculado automáticamente)">
                  <span className="ml-auto text-sm">🔒</span>
                </Tooltip>
              )}
            </label>
            <PriceInputEnhanced
              value={producto.costo}
              onChange={(valor) => onUpdateCampo('costo', valor ?? 0)}
              locked={producto.lockedFields.includes('costo')}
              type="costo"
              showCurrency
              size="lg"
              className="w-full"
            />
          </div>

          {/* Precio */}
          <div className="space-y-2.5">
            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${fieldColors.precio.label}`}>
              <div className={`p-1.5 rounded-lg ${fieldColors.precio.bg} border ${fieldColors.precio.border}`}>
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span>Precio</span>
              {producto.lockedFields.includes('precio') && (
                <Tooltip content="Campo bloqueado (calculado automáticamente)">
                  <span className="ml-auto text-sm">🔒</span>
                </Tooltip>
              )}
            </label>
            <PriceInputEnhanced
              value={producto.precio}
              onChange={(valor) => onUpdateCampo('precio', valor ?? 0)}
              locked={producto.lockedFields.includes('precio')}
              type="precio"
              showCurrency
              size="lg"
              className="w-full"
            />
          </div>
        </div>

        {/* Fila 2: Markup y Margen */}
        <div className="grid grid-cols-2 gap-4">
          {/* Markup */}
          <div className="space-y-2.5">
            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${fieldColors.markup.label}`}>
              <div className={`p-1.5 rounded-lg ${fieldColors.markup.bg} border ${fieldColors.markup.border}`}>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span>Markup</span>
              {producto.lockedFields.includes('markup') && (
                <Tooltip content="Campo bloqueado (calculado automáticamente)">
                  <span className="ml-auto text-sm">🔒</span>
                </Tooltip>
              )}
            </label>
            <PriceInputEnhanced
              value={producto.markup}
              onChange={(valor) => onUpdateCampo('markup', valor ?? 0)}
              locked={producto.lockedFields.includes('markup')}
              type="markup"
              showPercent
              size="lg"
              decimals={1}
              className="w-full"
            />
          </div>

          {/* Margen */}
          <div className="space-y-2.5">
            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${fieldColors.margen.label}`}>
              <div className={`p-1.5 rounded-lg ${fieldColors.margen.bg} border ${fieldColors.margen.border}`}>
                <Percent className="w-3.5 h-3.5" />
              </div>
              <span>Margen</span>
              {producto.lockedFields.includes('margen') && (
                <Tooltip content="Campo bloqueado (calculado automáticamente)">
                  <span className="ml-auto text-sm">🔒</span>
                </Tooltip>
              )}
            </label>
            <PriceInputEnhanced
              value={producto.margen}
              onChange={(valor) => onUpdateCampo('margen', valor ?? 0)}
              locked={producto.lockedFields.includes('margen')}
              type="margen"
              showPercent
              size="lg"
              decimals={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Ganancia - mejorada */}
        <div className="pt-3 mt-1 border-t-2 border-[var(--border-secondary)]">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Ganancia:</span>
              {showWarning && (
                <Tooltip content="Ingrese Costo o Precio para calcular">
                  <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" />
                </Tooltip>
              )}
            </div>
            {producto.costo !== null && producto.precio !== null ? (
              <ProfitDisplay value={producto.precio - producto.costo} />
            ) : (
              <span className="text-sm font-semibold text-[var(--text-tertiary)]">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarginProductCard;
