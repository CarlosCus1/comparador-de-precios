import React, { useState, useCallback, useId } from 'react';

interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'devoluciones' | 'pedido' | 'inventario' | 'comparador';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  placeholder?: string;
  showRequired?: boolean;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  helpText,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  placeholder,
  showRequired = false,
  className = '',
  id,
  required,
  disabled,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const autoId = useId();
  const inputId = id || `enhanced-input-${autoId}`;

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  }, [props]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  }, [props]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  }, [props]);

  // Clases dinámicas
  const variantClass = variant !== 'default' ? `input-${variant}` : '';
  const sizeClass = `input-${size}`;
  const stateClass = error ? 'input-error' : hasValue ? 'input-success' : '';
  const focusClass = isFocused ? 'focused' : '';
  const disabledClass = disabled ? 'disabled' : '';

  const inputClasses = [
    'input-enhanced',
    variantClass,
    sizeClass,
    stateClass,
    focusClass,
    disabledClass,
    leftIcon ? 'with-left-icon' : '',
    rightIcon ? 'with-right-icon' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="enhanced-input-group">
      {label && (
        <label 
          htmlFor={inputId} 
          className="enhanced-input-label"
        >
          {label}
          {(required || showRequired) && <span className="required-indicator">*</span>}
        </label>
      )}

      <div className="enhanced-input-container">
        {leftIcon && (
          <div className="input-icon-left">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={
            [
              error ? `${inputId}-error` : null,
              helpText ? `${inputId}-help` : null
            ].filter(Boolean).join(' ') || undefined
          }
          {...props}
        />

        {rightIcon && (
          <div className="input-icon-right">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <div id={`${inputId}-error`} className="input-error-message">
          <svg className="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {helpText && !error && (
        <div id={`${inputId}-help`} className="input-help-message">
          <svg className="help-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {helpText}
        </div>
      )}
    </div>
  );
};

// Componente especializado para campos de cliente
export const ClienteInput: React.FC<Omit<EnhancedInputProps, 'placeholder' | 'variant'>> = (props) => {
  return (
    <EnhancedInput
      {...props}
      variant="default"
      placeholder="Ingrese el nombre o razón social..."
      helpText="Nombre completo o razón social del cliente"
    />
  );
};

// Componente especializado para documento (DNI/RUC)
export const DocumentoInput: React.FC<Omit<EnhancedInputProps, 'placeholder' | 'variant'>> = (props) => {
  return (
    <EnhancedInput
      {...props}
      variant="default"
      placeholder="DNI (8 dígitos) o RUC (11 dígitos)..."
      helpText="Documento de identidad: DNI para personas, RUC para empresas"
    />
  );
};

// Componente especializado para fechas
export const FechaInput: React.FC<Omit<EnhancedInputProps, 'placeholder' | 'variant'>> = (props) => {
  return (
    <EnhancedInput
      {...props}
      variant="default"
      placeholder="Seleccione la fecha..."
      helpText="Fecha en formato DD/MM/YYYY"
    />
  );
};

// Componente especializado para búsqueda
export const BusquedaInput: React.FC<Omit<EnhancedInputProps, 'placeholder' | 'variant'>> = (props) => {
  return (
    <EnhancedInput
      {...props}
      variant="default"
      placeholder="Buscar productos, códigos, nombres..."
      leftIcon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      }
      helpText="Escriba para buscar en el catálogo de productos"
    />
  );
};