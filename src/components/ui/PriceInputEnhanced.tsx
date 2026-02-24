// --------------------------------------------------------------------------- #
//                                                                             #
//              src/components/ui/PriceInputEnhanced.tsx                       #
//           Input de Precio Mejorado con selección automática                 #
//                                                                             #
// --------------------------------------------------------------------------- //

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

export interface PriceInputEnhancedProps {
  /** Valor actual del input */
  value: number | null;
  /** Callback cuando cambia el valor */
  onChange: (value: number | null) => void;
  /** Placeholder cuando está vacío */
  placeholder?: string;
  /** Si el input está deshabilitado */
  disabled?: boolean;
  /** Si el input está bloqueado (calculado automáticamente) */
  locked?: boolean;
  /** Tipo de input para aplicar colores */
  type?: 'costo' | 'precio' | 'markup' | 'margen' | 'ganancia' | 'default';
  /** Decimales a mostrar */
  decimals?: number;
  /** Clases adicionales */
  className?: string;
  /** Tamaño del input */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar símbolo de moneda */
  showCurrency?: boolean;
  /** Mostrar símbolo de porcentaje */
  showPercent?: boolean;
}

/**
 * Colores según el tipo de input
 */
const typeColors = {
  costo: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    header: 'bg-emerald-500',
    locked: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  precio: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-300 dark:border-orange-700',
    borderFocus: 'focus:border-orange-500 focus:ring-orange-500/20',
    text: 'text-orange-700 dark:text-orange-400',
    header: 'bg-orange-500',
    locked: 'bg-orange-100 dark:bg-orange-900/50',
  },
  markup: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-300 dark:border-blue-700',
    borderFocus: 'focus:border-blue-500 focus:ring-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    header: 'bg-blue-500',
    locked: 'bg-blue-100 dark:bg-blue-900/50',
  },
  margen: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-300 dark:border-purple-700',
    borderFocus: 'focus:border-purple-500 focus:ring-purple-500/20',
    text: 'text-purple-700 dark:text-purple-400',
    header: 'bg-purple-500',
    locked: 'bg-purple-100 dark:bg-purple-900/50',
  },
  ganancia: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-300 dark:border-green-700',
    borderFocus: 'focus:border-green-500 focus:ring-green-500/20',
    text: 'text-green-700 dark:text-green-400',
    header: 'bg-green-500',
    locked: 'bg-green-100 dark:bg-green-900/50',
  },
  default: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    borderFocus: 'focus:border-primary-500 focus:ring-primary-500/20',
    text: 'text-gray-700 dark:text-gray-300',
    header: 'bg-gray-500',
    locked: 'bg-gray-100 dark:bg-gray-700',
  },
};

const sizeClasses = {
  sm: 'w-20 px-2 py-1 text-xs',
  md: 'w-28 px-3 py-2 text-sm',
  lg: 'w-full px-4 py-3 text-base min-h-[44px]',
  mobile: 'w-full px-4 py-3 text-base min-h-[48px]',
};

/**
 * Input de precio mejorado que selecciona todo el contenido al enfocar
 * y aplica colores según el tipo de dato
 */
export const PriceInputEnhanced: React.FC<PriceInputEnhancedProps> = ({
  value,
  onChange,
  placeholder = '0.00',
  disabled = false,
  locked = false,
  type = 'default',
  decimals = 2,
  className = '',
  size = 'md',
  showCurrency = false,
  showPercent = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const colors = typeColors[type];
  
  // Estado interno para el valor de visualización (permite escribir libremente)
  const [displayValue, setDisplayValue] = useState<string>(() => 
    value !== null && value !== undefined ? value.toFixed(decimals) : ''
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sincronizar cuando cambia el valor externo (solo cuando no está enfocado)
  useEffect(() => {
    if (!isFocused) {
      const newDisplayValue = value !== null && value !== undefined ? value.toFixed(decimals) : '';
      // Usamos flushSync para evitar el warning de cascading renders
      // Este patrón es necesario para inputs que necesitan estado interno durante la edición
      flushSync(() => {
        setDisplayValue(newDisplayValue);
      });
    }
  }, [value, decimals, isFocused]);

  // Seleccionar todo el contenido al enfocar
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Seleccionar todo el texto
    e.target.select();
  }, []);

  // Manejar cambio de valor (solo actualiza el estado interno)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permitir solo números, punto y signo negativo
    const cleanedValue = inputValue.replace(/[^0-9.-]/g, '');
    
    // Validar que solo haya un punto
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      return; // No permitir más de un punto
    }
    
    setDisplayValue(cleanedValue);
  }, []);

  // Manejar pérdida de foco (formatear y guardar)
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    if (displayValue === '' || displayValue === '-') {
      onChange(null);
      setDisplayValue('');
      return;
    }

    const numValue = parseFloat(displayValue);
    if (!isNaN(numValue)) {
      const roundedValue = parseFloat(numValue.toFixed(decimals));
      onChange(roundedValue);
      setDisplayValue(roundedValue.toFixed(decimals));
    } else {
      setDisplayValue('');
      onChange(null);
    }
  }, [displayValue, onChange, decimals]);

  // Manejar tecla Enter (confirmar valor)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }, []);

  // Determinar clases de color
  const getColorClasses = () => {
    if (locked) {
      return `${colors.locked} cursor-not-allowed opacity-90 border-2 border-dashed`;
    }
    if (disabled) {
      return 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50 border-2 border-gray-300';
    }
    return `${colors.bg} ${colors.border} ${colors.borderFocus}`;
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Símbolo de moneda */}
      {showCurrency && (
        <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-xs ${colors.text} pointer-events-none`}>
          S/
        </span>
      )}
      
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled || locked}
        placeholder={placeholder}
        className={`
          ${sizeClasses[size]}
          ${getColorClasses()}
          ${showCurrency ? 'pl-8' : ''}
          ${showPercent ? 'pr-8' : ''}
          rounded-lg
          text-right
          font-mono
          font-semibold
          border
          transition-all
          duration-200
          focus:outline-none
          focus:ring-2
          ${colors.text}
          ${locked ? 'shadow-inner' : ''}
        `}
        title={locked ? 'Campo calculado automáticamente 🔒' : undefined}
      />
      
      {/* Símbolo de porcentaje */}
      {showPercent && (
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${colors.text} pointer-events-none`}>
          %
        </span>
      )}
      
      {/* Indicador de bloqueado mejorado - Ajuste 1 */}
      {locked && (
        <div className="absolute -right-2 -top-2 bg-amber-400 dark:bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md border-2 border-white dark:border-gray-800" title="Campo bloqueado (calculado automáticamente)">
          🔒
        </div>
      )}
    </div>
  );
};

/**
 * Componente de encabezado de columna con color
 */
export interface ColoredHeaderProps {
  children: React.ReactNode;
  type?: 'costo' | 'precio' | 'markup' | 'margen' | 'ganancia' | 'default';
  className?: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

export const ColoredHeader: React.FC<ColoredHeaderProps> = ({
  children,
  type = 'default',
  className = '',
  icon,
  tooltip,
}) => {
  const colors = typeColors[type];

  return (
    <th 
      className={`
        ${colors.header}
        text-white
        font-semibold
        px-4
        py-3
        text-sm
        text-center
        ${className}
      `}
      title={tooltip}
    >
      <span className="flex items-center justify-center gap-1">
        {icon}
        {children}
      </span>
    </th>
  );
};

/**
 * Componente para mostrar porcentaje con color
 */
export interface PercentageDisplayProps {
  value: number | null;
  type?: 'markup' | 'margen';
  showSign?: boolean;
  className?: string;
}

export const PercentageDisplay: React.FC<PercentageDisplayProps> = ({
  value,
  type = 'margen',
  showSign = true,
  className = '',
}) => {
  if (value === null || value === undefined) {
    return <span className={`text-gray-400 ${className}`}>-</span>;
  }

  // Determinar color basado en el valor
  const getColorClass = () => {
    if (value > 0) {
      return type === 'margen' 
        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30';
    }
    if (value < 0) {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
    }
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
  };

  const formatPercent = (val: number): string => {
    const sign = showSign && val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  };

  return (
    <span className={`
      inline-flex
      items-center
      px-2
      py-1
      rounded-md
      font-mono
      font-semibold
      text-sm
      ${getColorClass()}
      ${className}
    `}>
      {formatPercent(value)}
    </span>
  );
};

/**
 * Componente para mostrar ganancia con color
 */
export interface ProfitDisplayProps {
  value: number | null;
  showCurrency?: boolean;
  className?: string;
}

export const ProfitDisplay: React.FC<ProfitDisplayProps> = ({
  value,
  showCurrency = true,
  className = '',
}) => {
  if (value === null || value === undefined) {
    return <span className={`text-gray-400 ${className}`}>-</span>;
  }

  const getColorClass = () => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatValue = (val: number): string => {
    const prefix = showCurrency ? 'S/ ' : '';
    const sign = val < 0 ? '-' : '';
    return `${sign}${prefix}${Math.abs(val).toFixed(2)}`;
  };

  return (
    <span className={`
      font-mono
      font-semibold
      ${getColorClass()}
      ${className}
    `}>
      {formatValue(value)}
    </span>
  );
};

export default PriceInputEnhanced;
