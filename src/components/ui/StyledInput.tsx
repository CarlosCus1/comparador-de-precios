import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// --- Definición de Variantes de Estilo ---
// Utilizamos `class-variance-authority` (cva) para gestionar las clases CSS de manera dinámica.
// Esto permite definir variantes base y modificadores de estilo de forma limpia.
const inputVariants = cva(
  'input transition-all duration-200', // Clases base aplicadas siempre
  {
    variants: {
      // Variante 'variant': Controla el tema de color del input según el módulo activo.
      // Estas clases (ej: 'module-devoluciones') activan variables CSS específicas definidas en design-system.css.
      variant: {
        devoluciones: 'module-devoluciones',
        pedido: 'module-pedido',
        inventario: 'module-inventario',
        comparador: 'module-comparador',
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// --- Definición de Props ---
// Extendemos las props nativas de un input HTML, omitiendo 'size' para evitar conflictos.
// `VariantProps<typeof inputVariants>` infiere los tipos de las variantes definidas en `cva`.
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  variant?: 'devoluciones' | 'pedido' | 'inventario' | 'comparador' | 'default';
  compact?: boolean; // Propiedad opcional para reducir el padding vertical
}

// --- Componente StyledInput ---
/**
 * Componente de Input Estilizado
 * 
 * Un wrapper alrededor del elemento nativo `input` que aplica automáticamente
 * los estilos del sistema de diseño y soporta theming por módulo.
 */
const StyledInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, compact = true, ...rest }, ref) => {
    // Separamos las props que no son atributos válidos del DOM (aunque en este caso 'compact' y 'variant' ya se extrajeron)
    const { ...domProps } = rest;

    return (
      <input
        // Combinamos las clases generadas por `cva` con clases personalizadas y lógica condicional
        className={`${inputVariants({ variant, className })} ${compact ? 'py-2' : ''}`}
        ref={ref}
        {...domProps}
      />
    );
  }
);

StyledInput.displayName = 'StyledInput';

export { StyledInput };