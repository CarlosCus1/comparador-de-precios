import { useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Tipos locales para el hook
 */
export type UserRole = 'Form' | 'Usuario' | 'DashboardData';

export interface ProductData {
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  disponible?: boolean;
  sku?: string;
}

/**
 * Esquema de validación para filtros
 */
export const filterSchema = z.object({
  marcas: z.array(z.string()).optional(),
  categorias: z.array(z.string()).optional(),
  rangoPrecios: z.object({
    min: z.number().min(0).optional(),
    max: z.number().max(1000000).optional(),
  }).optional(),
  soloDisponibles: z.boolean().optional(),
  ordenarPor: z.enum(['precio', 'nombre', 'categoria', 'marca']).optional(),
  orden: z.enum(['asc', 'desc']).optional(),
  busqueda: z.string().optional(),
  filtroRapido: z.string().optional(),
});

export type FilterFormData = z.infer<typeof filterSchema>;

/**
 * Configuración de filtros por rol de usuario
 */
export const roleFilterConfig: Record<UserRole, {
  camposVisibles: (keyof FilterFormData)[];
  filtrosPredeterminados: Partial<FilterFormData>;
  puedeCrearPresets: boolean;
}> = {
  Form: {
    camposVisibles: ['marcas', 'categorias', 'rangoPrecios', 'soloDisponibles', 'ordenarPor', 'orden', 'busqueda'],
    filtrosPredeterminados: { soloDisponibles: true, ordenarPor: 'precio', orden: 'asc' },
    puedeCrearPresets: true,
  },
  Usuario: {
    camposVisibles: ['marcas', 'categorias', 'rangoPrecios', 'soloDisponibles', 'busqueda', 'filtroRapido'],
    filtrosPredeterminados: {},
    puedeCrearPresets: false,
  },
  DashboardData: {
    camposVisibles: ['marcas', 'categorias', 'rangoPrecios', 'ordenarPor', 'orden'],
    filtrosPredeterminados: { ordenarPor: 'precio', orden: 'asc' },
    puedeCrearPresets: false,
  },
};

// Storage key for persisted filters
const FILTERS_STORAGE_KEY = 'smart-filters-persisted';

/**
 * Hook para filtros inteligentes con persistencia
 */
export const useSmartFilter = (
  datosOriginales: ProductData[],
  role: UserRole = 'Usuario'
) => {
  const config = roleFilterConfig[role];
  
  // Cargar filtros persistidos del localStorage
  const getPersistedFilters = (): Partial<FilterFormData> => {
    try {
      const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };
  
  // Guardar filtros en localStorage
  const persistFilters = (filters: Partial<FilterFormData>) => {
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // Ignore storage errors
    }
  };
  
  // Limpiar filtros persistidos
  const clearPersistedFilters = () => {
    try {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };
  
  // Inicializar formulario con valores persistidos o predeterminados
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FilterFormData>({
    defaultValues: {
      ...config.filtrosPredeterminados,
      ...getPersistedFilters(),
    },
  });

  // Observar cambios para persistencia automática
  const valoresWatch = watch();
  
  useEffect(() => {
    if (isDirty) {
      const timeout = setTimeout(() => {
        persistFilters(valoresWatch);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [valoresWatch, isDirty]);

  // Aplicar filtros a los datos
  const datosFiltrados = useMemo(() => {
    let resultado = [...datosOriginales];

    // Filtro por marcas
    const marcasSeleccionadas = valoresWatch.marcas;
    if (marcasSeleccionadas && marcasSeleccionadas.length > 0) {
      resultado = resultado.filter((p: ProductData) => marcasSeleccionadas.includes(p.marca));
    }

    // Filtro por categorías
    const categoriasSeleccionadas = valoresWatch.categorias;
    if (categoriasSeleccionadas && categoriasSeleccionadas.length > 0) {
      resultado = resultado.filter((p: ProductData) => categoriasSeleccionadas.includes(p.categoria));
    }

    // Filtro por rango de precios
    const { min, max } = valoresWatch.rangoPrecios || {};
    if (min !== undefined) {
      resultado = resultado.filter((p: ProductData) => p.precio >= min);
    }
    if (max !== undefined) {
      resultado = resultado.filter((p: ProductData) => p.precio <= max);
    }

    // Filtro solo disponibles
    if (valoresWatch.soloDisponibles) {
      resultado = resultado.filter((p: ProductData) => p.disponible);
    }

    // Búsqueda textual
    const busqueda = valoresWatch.busqueda?.toLowerCase().trim();
    if (busqueda) {
      resultado = resultado.filter((p: ProductData) => 
        p.nombre.toLowerCase().includes(busqueda) ||
        p.marca.toLowerCase().includes(busqueda) ||
        (p.sku && p.sku.toLowerCase().includes(busqueda))
      );
    }

    // Ordenamiento
    const ordenarPor = valoresWatch.ordenarPor || 'precio';
    const orden = valoresWatch.orden || 'asc';
    
    resultado.sort((a, b) => {
      let comparison = 0;
      switch (ordenarPor) {
        case 'precio':
          comparison = a.precio - b.precio;
          break;
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre);
          break;
        case 'categoria':
          comparison = a.categoria.localeCompare(b.categoria);
          break;
        case 'marca':
          comparison = a.marca.localeCompare(b.marca);
          break;
      }
      return orden === 'asc' ? comparison : -comparison;
    });

    return resultado;
  }, [datosOriginales, valoresWatch]);

  // Contadores para UI
  const estadisticas = useMemo(() => ({
    total: datosOriginales.length,
    filtrados: datosFiltrados.length,
    porcentaje: datosOriginales.length > 0 
      ? Math.round((datosFiltrados.length / datosOriginales.length) * 100)
      : 0,
  }), [datosOriginales.length, datosFiltrados.length]);

  // Marcas disponibles para selector
  const marcasDisponibles = useMemo(() => {
    return [...new Set(datosOriginales.map((p: ProductData) => p.marca))].sort();
  }, [datosOriginales]);

  // Categorías disponibles para selector
  const categoriasDisponibles = useMemo(() => {
    return [...new Set(datosOriginales.map((p: ProductData) => p.categoria))].sort();
  }, [datosOriginales]);

  // Filtro rápido preestablecido
  const aplicarFiltroRapido = useCallback((tipo: string) => {
    switch (tipo) {
      case 'mas-baratos':
        setValue('ordenarPor', 'precio');
        setValue('orden', 'asc');
        setValue('soloDisponibles', true);
        break;
      case 'mas-caros':
        setValue('ordenarPor', 'precio');
        setValue('orden', 'desc');
        setValue('soloDisponibles', true);
        break;
      case 'recientes':
        setValue('ordenarPor', 'nombre');
        setValue('orden', 'asc');
        break;
      case 'todo':
        reset(config.filtrosPredeterminados);
        break;
    }
  }, [setValue, reset, config.filtrosPredeterminados]);

  // Resetear filtros
  const resetearFiltros = useCallback(() => {
    reset(config.filtrosPredeterminados);
    clearPersistedFilters();
  }, [reset, config.filtrosPredeterminados]);

  return {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    datosFiltrados,
    estadisticas,
    marcasDisponibles,
    categoriasDisponibles,
    aplicarFiltroRapido,
    resetearFiltros,
    config,
    errors,
  };
};

export default useSmartFilter;
