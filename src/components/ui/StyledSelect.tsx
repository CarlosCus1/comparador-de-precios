import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// --- Definición de Variantes de Estilo ---
// Utilizamos `class-variance-authority` (cva) para gestionar las clases CSS de manera dinámica.
const selectVariants = cva(
  // Clases base:
  // 'appearance-none': Oculta la flecha nativa del navegador para usar una personalizada.
  // 'bg-no-repeat bg-right pr-8': Prepara el espacio para el icono personalizado.
  'input appearance-none bg-no-repeat bg-right pr-8 transition-all duration-200',
  {
    variants: {
      // Variante 'variant': Controla el tema de color del select según el módulo activo.
      variant: {
        devoluciones: 'module-devoluciones',
        pedido: 'module-pedido',
        inventario: 'module-inventario',
        comparador: 'module-comparador',
        precios: 'module-comparador', // Alias para 'precios' que usa el mismo tema que comparador
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// --- Definición de Props ---
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
  VariantProps<typeof selectVariants> { }

// --- Componente StyledSelect ---
/**
 * Componente de Select Estilizado
 * 
 * Un wrapper alrededor del elemento nativo `select` que aplica estilos personalizados
 * y reemplaza la flecha nativa por un icono SVG consistente con el diseño.
 */
const StyledSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {/* Elemento Select Nativo */}
        <select
          className={selectVariants({ variant, className })}
          ref={ref}
          {...props}
        />
        {/* Icono de Flecha (Chevron) Personalizado */}
        {/* 'pointer-events-none': Permite que los clics pasen a través del icono hacia el select subyacente. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-tertiary)]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);

StyledSelect.displayName = 'StyledSelect';

export { StyledSelect };