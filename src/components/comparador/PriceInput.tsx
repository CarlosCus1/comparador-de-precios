import React, { useState, useCallback, useEffect } from 'react';

interface PriceInputProps {
  initialValue: number | null;
  onPriceChange: (value: number | null) => void;
  competidor: string;
  item: { codigo: string; nombre: string };
  size?: 'sm' | 'md' | 'lg';
  isBestOffer?: boolean;
  textColor?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  initialValue,
  onPriceChange,
  competidor,
  item,
  size = 'sm',
  isBestOffer = false,
  textColor,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    initialValue !== null ? initialValue.toFixed(2) : ''
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Observador para detectar cambios en el tema (claro/oscuro)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);


  // Sincronizar cuando cambie el valor inicial
  const handleInitialValueChange = useCallback((newInitialValue: number | null) => {
    const newDisplayValue = newInitialValue !== null ? newInitialValue.toFixed(2) : '';
    setDisplayValue(newDisplayValue);
  }, []);

  React.useEffect(() => {
    handleInitialValueChange(initialValue);
  }, [initialValue, handleInitialValueChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Seleccionar todo el texto al enfocar para facilitar la edición
    e.target.select();
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const cleanedValue = displayValue.replace(/[^0-9.]/g, '');
    let numericValue: number | null = null;
    let displayValueForUI: string = displayValue;

    if (cleanedValue !== '') {
      const parsed = parseFloat(cleanedValue);
      if (!isNaN(parsed)) {
        numericValue = parseFloat(parsed.toFixed(2));
        displayValueForUI = numericValue.toFixed(2);
      } else {
        displayValueForUI = cleanedValue;
      }
    } else {
      displayValueForUI = '';
    }

    onPriceChange(numericValue);
    setDisplayValue(displayValueForUI);
  };

  const sizeClass = size === 'sm' ? 'price-cell-45' : size === 'lg' ? 'input-lg' : 'input-md';
  const ariaLabel = `Precio de ${item.nombre} en ${competidor}`;
  const placeholderText = competidor === 'Sugerido' ? 'Precio sugerido' : 'Precio en ' + competidor;

  const inputStyle: React.CSSProperties = {};
  if (textColor) { // Aplicar color siempre si se provee, no solo en dark mode
    inputStyle.color = textColor;
    inputStyle.fontWeight = isDarkMode ? '600' : '500'; 
  }

  const handleDisplayClick = () => {
    setIsFocused(true);
  };

  // Clase consistente para display y input (Mejora de consistencia)
  const consistentClass = 'rounded-md border border-[var(--border-primary)] bg-[var(--surface-elevated)] h-8 flex items-center px-2.5 text-sm font-mono font-medium text-right w-[75px]';

  return (
    <div className="relative h-full price-input-wrapper">
      {!isFocused ? (
        <div
          onClick={handleDisplayClick}
          role="button"
          tabIndex={0}
          onFocus={handleDisplayClick}
          aria-label={`Precio actual: ${initialValue !== null ? `S/ ${initialValue.toFixed(2)}` : 'No establecido'}. Presione para editar.`}
          className={`
            ${consistentClass}
            ${isBestOffer ? 'border-[var(--color-success)] ring-1 ring-[var(--color-success)]/30' : 'border-transparent'}
            cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors price-cell
          `}
          style={inputStyle}
        >
          {initialValue !== null ? (
            <span>
              <span className="currency-symbol">S/</span>
              <span className="font-semibold">{initialValue.toFixed(2)}</span>
            </span>
          ) : (
            <span className="text-[var(--text-tertiary)] opacity-60 text-xs">{placeholderText}</span>
          )}
        </div>
      ) : (
        <input
          type="text"
          aria-label={ariaLabel}
          aria-describedby={`help-${item.codigo}-${competidor}`}
          placeholder={placeholderText}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          className={`
            ${consistentClass}
            ${isBestOffer ? 'border-[var(--color-success)] ring-1 ring-[var(--color-success)]/30' : ''}
            focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30
          `}
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          autoFocus
        />
      )}

      {isBestOffer && !isFocused && (
        <div className="absolute -right-2 -top-2 z-10 animate-bounce-subtle">
          <div className="bg-[var(--color-success)] text-white p-1 rounded-full shadow-lg border-2 border-[var(--surface-primary)]" title="Mejor Oferta">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      )}
      <div
        id={`help-${item.codigo}-${competidor}`}
        className="sr-only"
      >
        Ingrese el precio en soles peruanos para {item.nombre} en {competidor}
      </div>
      {isFocused && (
        <div className="absolute -top-8 left-0 z-20 px-2 py-1 text-xs bg-neutral-800 text-white rounded shadow-lg whitespace-nowrap">
          {competidor === 'Sugerido'
            ? 'Precio sugerido (opcional)'
            : `Precio ${competidor} en S/`
          }
        </div>
      )}
    </div>
  );
};
