// Module types for the inventory management system
export enum ModuleType {
  DEVOLUCIONES = 'devoluciones',
  PEDIDO = 'pedido',
  INVENTARIO = 'inventario',
  COMPARADOR = 'comparador',
}

// Module colors for UI theming
export enum ModuleColor {
  DEVOLUCIONES = '#DC2626',
  PEDIDO = '#0A3D62',
  INVENTARIO = '#0D9488',
  COMPARADOR = '#F4B400',
}

// Animation duration types
export enum AnimationDuration {
  FAST = '200ms',
  NORMAL = '300ms',
  SLOW = '500ms',
  VERY_SLOW = '1000ms',
}