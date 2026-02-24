// --------------------------------------------------------------------------- #
//                                                                             #
//              src/pages/MarginCalculatorPage.tsx                             #
//           Calculadora de Margen - Página Principal                          #
//                                                                             #
// --------------------------------------------------------------------------- //

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMarginStore, type MarginProduct, type MarginClient } from '../store/useMarginStore';
import { useAppStore } from '../store/useAppStore';
import { useSearch } from '../hooks/useSearch';
import { useToast } from '../contexts/ToastContext';
import { Tooltip, Modal } from '../components/ui';
import { DataTable, type IColumn } from '../components/DataTable';
import { 
  PriceInputEnhanced, 
  ColoredHeader, 
  ProfitDisplay 
} from '../components/ui/PriceInputEnhanced';
import MarginProductCard from '../components/ui/MarginProductCard';
import { exportMarginToExcel } from '../utils/marginExcelExport';
import type { IProducto } from '../interfaces';
import {
  Calculator,
  Search,
  Trash2,
  Download,
  RefreshCw,
  Percent,
  DollarSign,
  TrendingUp,
  AlertCircle,
  User,
  Building,
  X,
  Package,
  Tag,
  Layers,
  Plus,
} from 'lucide-react';

// --- Componente de Fila de Producto ---

interface MarginRowProps {
  producto: MarginProduct;
  onUpdateCampo: (campo: 'costo' | 'precio' | 'markup' | 'margen', valor: number) => void;
  onEliminar: () => void;
}

const MarginRow: React.FC<MarginRowProps> = ({ producto, onUpdateCampo, onEliminar }) => {
  // Determinar si mostrar advertencia de markup+margen sin valor absoluto
  const showWarning = producto.costo === null && producto.precio === null &&
                      (producto.markup !== null || producto.margen !== null);

  return (
    <tr className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]/50 transition-colors">
      {/* Código */}
      <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--text-tertiary)]" />
          {producto.codigo}
        </span>
      </td>
      
      {/* Nombre */}
      <td className="px-4 py-3 text-sm text-[var(--text-primary)] max-w-xs truncate" title={producto.nombre}>
        {producto.nombre}
      </td>
      
      {/* Costo (Mi Precio) */}
      <td className="px-4 py-3 text-center">
        <PriceInputEnhanced
          value={producto.costo}
          onChange={(valor) => onUpdateCampo('costo', valor ?? 0)}
          locked={producto.lockedFields.includes('costo')}
          type="costo"
          showCurrency
          size="sm"
        />
      </td>
      
      {/* Precio (Venta) */}
      <td className="px-4 py-3 text-center">
        <PriceInputEnhanced
          value={producto.precio}
          onChange={(valor) => onUpdateCampo('precio', valor ?? 0)}
          locked={producto.lockedFields.includes('precio')}
          type="precio"
          showCurrency
          size="sm"
        />
      </td>
      
      {/* Markup */}
      <td className="px-4 py-3 text-center">
        <PriceInputEnhanced
          value={producto.markup}
          onChange={(valor) => onUpdateCampo('markup', valor ?? 0)}
          locked={producto.lockedFields.includes('markup')}
          type="markup"
          showPercent
          size="sm"
          decimals={1}
        />
      </td>
      
      {/* Margen */}
      <td className="px-4 py-3 text-center">
        <PriceInputEnhanced
          value={producto.margen}
          onChange={(valor) => onUpdateCampo('margen', valor ?? 0)}
          locked={producto.lockedFields.includes('margen')}
          type="margen"
          showPercent
          size="sm"
          decimals={1}
        />
      </td>
      
      {/* Ganancia */}
      <td className="px-4 py-3 text-center">
        {producto.costo !== null && producto.precio !== null ? (
          <ProfitDisplay value={producto.precio - producto.costo} />
        ) : (
          <span className="text-[var(--text-tertiary)]">-</span>
        )}
      </td>
      
      {/* Acciones */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {showWarning && (
            <Tooltip content="Ingrese Costo o Precio para calcular">
              <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" />
            </Tooltip>
          )}
          <button
            onClick={onEliminar}
            className="p-2 rounded-lg hover:bg-[var(--color-danger)]/10 text-[var(--color-danger)] transition-colors"
            title="Eliminar producto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- Helpers para selección por línea ---

function getUniqueSortedLineas(productos: IProducto[]): string[] {
  const set = new Set<string>();
  for (const p of productos) {
    const linea = (p.linea ?? "").toString().trim();
    if (linea) set.add(linea);
  }
  const collator = new Intl.Collator("es-PE");
  return Array.from(set).sort((a, b) => collator.compare(a, b));
}

function sortByCodigoAsc(productos: IProducto[]): IProducto[] {
  const collator = new Intl.Collator("es-PE", { numeric: true, sensitivity: "base" });
  return [...productos].sort((a, b) =>
    collator.compare(String(a.codigo ?? ""), String(b.codigo ?? ""))
  );
}

function normalize(s: string) {
  return s.toLocaleLowerCase("es-PE");
}

// --- Componente Principal ---

export const MarginCalculatorPage: React.FC = () => {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedSearchResults, setSelectedSearchResults] = useState<Set<string>>(new Set()); // Estado para selección múltiple en búsqueda
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Estado para posición del dropdown (reservado para uso futuro)
  // const [searchDropdownStyle, setSearchDropdownStyle] = useState<React.CSSProperties>({});
  const [selectedLinea, setSelectedLinea] = useState<string>('');
  const [searchNombre, setSearchNombre] = useState('');
  const [selectedCodigos, setSelectedCodigos] = useState<Set<string | number>>(new Set());
  const [globalApplyModal, setGlobalApplyModal] = useState<'margen' | 'markup' | null>(null);
  const [productosBackup, setProductosBackup] = useState<MarginProduct[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [tableSortBy, setTableSortBy] = useState<'codigo' | 'nombre' | 'costo' | 'precio'>('codigo');
  
  // Stores
  const { productos, agregarProducto, actualizarCampo, eliminarProducto, limpiarTodo, 
          margenGlobal, markupGlobal, setMargenGlobal, setMarkupGlobal, 
          aplicarMargenGlobal, aplicarMarkupGlobal, cliente, setCliente } = useMarginStore();
  const { catalogo, cargarCatalogo, loading, catalogCount } = useAppStore();
  
  // Hooks
  const { addToast } = useToast();
  const searchResults = useSearch(catalogo, searchTerm);
  
  // Cargar catálogo al montar
  useEffect(() => {
    cargarCatalogo();
  }, [cargarCatalogo]);
  
  // Nota: Ya NO filtramos productos ya agregados - ahora se muestran con aviso de "Ya seleccionado"
  // Los productos ya agregados aparecen en los resultados pero con indicador visual
  
  // Limitar a 20 resultados para mejor UX
  const displayedResults = useMemo(() => searchResults.slice(0, 20), [searchResults]);
  
  // Funciones para manejar selección múltiple en resultados de búsqueda
  const toggleSearchResultSelection = useCallback((codigo: string) => {
    setSelectedSearchResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(codigo)) {
        newSet.delete(codigo);
      } else {
        newSet.add(codigo);
      }
      return newSet;
    });
  }, []);
  
  const toggleSelectAllSearchResults = useCallback(() => {
    if (selectedSearchResults.size === displayedResults.length) {
      setSelectedSearchResults(new Set());
    } else {
      setSelectedSearchResults(new Set(displayedResults.map(p => p.codigo)));
    }
  }, [displayedResults, selectedSearchResults.size]);
  
  const addSelectedSearchResults = useCallback(() => {
    const productsToAdd = displayedResults.filter(p => selectedSearchResults.has(p.codigo));
    productsToAdd.forEach(p => agregarProducto(p));
    setSearchTerm('');
    setShowResults(false);
    setSelectedSearchResults(new Set());
    if (productsToAdd.length > 0) {
      addToast(`${productsToAdd.length} producto(s) agregado(s) a la calculadora`, 'success');
    }
  }, [displayedResults, selectedSearchResults, agregarProducto, addToast]);
  
  // Limpiar selección cuando el término de búsqueda cambia
  const clearSearchSelection = useCallback(() => {
    setSelectedSearchResults(new Set());
  }, []);
  
  // Nota: El dropdown ahora usa portal con posición fixed centrada
  
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showResults && searchInputRef.current) {
        const inputRect = searchInputRef.current.getBoundingClientRect();
        const isClickInsideInput = (
          event.clientX >= inputRect.left &&
          event.clientX <= inputRect.right &&
          event.clientY >= inputRect.top &&
          event.clientY <= inputRect.bottom
        );
        
        // El dropdown está centrado, verificamos si el clic está cerca del centro
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const dropdownCenterX = windowWidth / 2;
        const dropdownCenterY = windowHeight / 2;
        const dropdownWidth = Math.min(windowWidth * 0.9, 600);
        const dropdownHeight = 400; // max-h-96 approx
        
        const isClickInsideDropdown = (
          event.clientX >= dropdownCenterX - dropdownWidth / 2 &&
          event.clientX <= dropdownCenterX + dropdownWidth / 2 &&
          event.clientY >= dropdownCenterY - dropdownHeight / 2 &&
          event.clientY <= dropdownCenterY + dropdownHeight / 2
        );
        
        if (!isClickInsideInput && !isClickInsideDropdown) {
          setShowResults(false);
          setSearchTerm('');
          clearSearchSelection();
        }
      }
    };
    
    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults, clearSearchSelection]);
  
  // Líneas únicas para el modal
  const lineas = useMemo(() => (catalogo ? getUniqueSortedLineas(catalogo) : []), [catalogo]);
  
  // Productos de la línea seleccionada
  const productosDeLinea = useMemo(() => {
    if (!catalogo || !selectedLinea) return [];
    const base = catalogo.filter((p) => (p.linea ?? "").toString().trim() === selectedLinea);
    const ordenados = sortByCodigoAsc(base);
    if (!searchNombre.trim()) return ordenados;
    const term = normalize(searchNombre.trim());
    return ordenados.filter((p: IProducto) => normalize(p.nombre ?? "").includes(term));
  }, [catalogo, selectedLinea, searchNombre]);
  
  // Productos ordenados y filtrados para la tabla (Ajuste 4)
  const productosOrdenados = useMemo(() => {
    let filtered = productos;
    
    // Filtro de búsqueda
    if (tableSearch.trim()) {
      const term = normalize(tableSearch.trim());
      filtered = filtered.filter(p => 
        normalize(p.codigo).includes(term) || 
        normalize(p.nombre).includes(term)
      );
    }
    
    // Ordenamiento
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const collator = new Intl.Collator('es-PE', { numeric: true });
      switch (tableSortBy) {
        case 'codigo':
          return collator.compare(a.codigo, b.codigo);
        case 'nombre':
          return collator.compare(a.nombre, b.nombre);
        case 'costo':
          return (a.costo ?? 0) - (b.costo ?? 0);
        case 'precio':
          return (a.precio ?? 0) - (b.precio ?? 0);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [productos, tableSearch, tableSortBy]);
  
  // Determinar si se puede agregar manualmente
  // Ahora verifica si no hay resultados de búsqueda Y el término no está vacío
  const canAddManually = searchTerm.trim().length > 0 && searchResults.length === 0;
  
  // Handlers
  const handleAgregarManual = useCallback(() => {
    if (!canAddManually) return;
    agregarProducto({
      codigo: searchTerm.trim(),
      nombre: searchTerm.trim(),
      cod_ean: '',
      ean_14: '',
      peso: 0,
      stock_referencial: 0,
      linea: '',
      keywords: [],
    });
    setSearchTerm('');
    setShowResults(false);
    addToast(`Producto "${searchTerm.trim()}" agregado manualmente`, 'success');
  }, [canAddManually, searchTerm, agregarProducto, addToast]);
  
  const handleUpdateCampo = useCallback((codigo: string, campo: 'costo' | 'precio' | 'markup' | 'margen', valor: number) => {
    actualizarCampo(codigo, campo, valor);
  }, [actualizarCampo]);
  
  const handleEliminarProducto = useCallback((codigo: string) => {
    eliminarProducto(codigo);
    addToast('Producto eliminado', 'info');
  }, [eliminarProducto, addToast]);
  
  const handleLimpiarTodo = useCallback(() => {
    if (window.confirm('¿Está seguro de que desea limpiar todos los productos?')) {
      limpiarTodo();
      addToast('Todos los productos han sido eliminados', 'info');
    }
  }, [limpiarTodo, addToast]);
  
  const handleAplicarMargenGlobal = useCallback(() => {
    setProductosBackup(productos);
    setGlobalApplyModal('margen');
  }, [productos]);
  
  const handleAplicarMarkupGlobal = useCallback(() => {
    setProductosBackup(productos);
    setGlobalApplyModal('markup');
  }, [productos]);
  
  const confirmGlobalApply = useCallback(() => {
    if (globalApplyModal === 'margen') {
      aplicarMargenGlobal();
      addToast(`Margen del ${margenGlobal}% aplicado a ${productos.filter(p => p.costo !== null).length} productos`, 'success');
    } else if (globalApplyModal === 'markup') {
      aplicarMarkupGlobal();
      addToast(`Markup del ${markupGlobal}% aplicado a ${productos.filter(p => p.costo !== null).length} productos`, 'success');
    }
    setGlobalApplyModal(null);
  }, [globalApplyModal, aplicarMargenGlobal, aplicarMarkupGlobal, margenGlobal, markupGlobal, productos, addToast]);
  
  const undoGlobalApply = useCallback(() => {
    if (productosBackup.length > 0) {
      useMarginStore.setState({ productos: productosBackup });
      addToast('Cambios deshechados', 'info');
      setGlobalApplyModal(null);
    }
  }, [productosBackup, addToast]);
  
  // Handler para aplicación desde el modal
  void undoGlobalApply; // Referencia para próximas mejoras
  
  // Exportar a Excel
  const handleExportar = useCallback(async () => {
    try {
      await exportMarginToExcel(productos, cliente);
      addToast('Archivo Excel generado correctamente', 'success');
    } catch {
      addToast('Error al generar el archivo Excel', 'error');
    }
  }, [productos, cliente, addToast]);
  
  // Handler para cambios en cliente
  const handleClienteChange = useCallback((campo: keyof MarginClient, valor: string) => {
    setCliente({ ...cliente, [campo]: valor });
  }, [cliente, setCliente]);
  
  // Handlers para modal de línea
  const toggleSelection = useCallback((codigo: string | number) => {
    setSelectedCodigos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(codigo)) {
        newSet.delete(codigo);
      } else {
        newSet.add(codigo);
      }
      return newSet;
    });
  }, []);
  
  const toggleSelectAll = useCallback(() => {
    if (selectedCodigos.size === productosDeLinea.length) {
      setSelectedCodigos(new Set());
    } else {
      setSelectedCodigos(new Set(productosDeLinea.map(p => p.codigo)));
    }
  }, [selectedCodigos, productosDeLinea]);
  
  const handleConfirmLineSelection = useCallback(() => {
    if (!catalogo) return;
    
    const codigosAgregados = new Set(productos.map(p => p.codigo));
    const seleccionados = productosDeLinea.filter((p) => selectedCodigos.has(String(p.codigo)));
    const nuevos: IProducto[] = [];
    const duplicados: IProducto[] = [];
    
    for (const p of seleccionados) {
      if (codigosAgregados.has(String(p.codigo))) {
        duplicados.push(p);
      } else {
        nuevos.push(p);
      }
    }
    
    for (const item of nuevos) {
      agregarProducto(item);
    }
    
    if (nuevos.length > 0) {
      addToast(`${nuevos.length} productos agregados`, 'success');
    }
    if (duplicados.length > 0) {
      addToast(`${duplicados.length} productos ya estaban en la lista`, 'warning');
    }
    
    setLineModalOpen(false);
  }, [catalogo, productos, productosDeLinea, selectedCodigos, agregarProducto, addToast]);
  
  // Columnas para el modal de selección por línea
  const lineModalColumns: IColumn<IProducto>[] = useMemo(() => [
    {
      header: (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-blue-600"
          checked={selectedCodigos.size === productosDeLinea.length && productosDeLinea.length > 0}
          onChange={toggleSelectAll}
        />
      ),
      accessor: 'codigo',
      align: 'center',
      cellRenderer: (item: IProducto) => (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-blue-600"
          checked={selectedCodigos.has(item.codigo)}
          onChange={() => toggleSelection(item.codigo)}
        />
      )
    },
    {
      header: 'Código',
      accessor: 'codigo',
      cellRenderer: (item: IProducto) => (
        <span className="font-mono text-sm">{item.codigo}</span>
      )
    },
    {
      header: 'Nombre',
      accessor: 'nombre',
      cellRenderer: (item: IProducto) => (
        <span className="truncate max-w-xs" title={item.nombre}>
          {item.nombre}
        </span>
      )
    }
  ], [selectedCodigos, productosDeLinea, toggleSelectAll, toggleSelection]);
  
  return (
    <div className="min-h-screen pb-20 module-margen" role="main">
      <div className="container-app py-8 space-y-8">
        
        {/* Encabezado */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <Calculator className="w-10 h-10 text-[var(--color-primary)]" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Calculadora de Margen
            </h1>
          </div>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Calcula markup y margen de ganancia de forma rápida y sencilla
          </p>
          {catalogCount > 0 && (
            <p className="text-sm text-[var(--text-tertiary)]">
              <Package className="w-4 h-4 inline mr-1" />
              {catalogCount} productos en catálogo
            </p>
          )}
        </div>
        
        {/* Sección de Cliente */}
        <section className="glass-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Datos Generales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Documento (RUC/DNI)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={cliente.documento}
                  onChange={(e) => handleClienteChange('documento', e.target.value)}
                  placeholder="Documento"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Cliente / Razón Social
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={cliente.nombre}
                  onChange={(e) => handleClienteChange('nombre', e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Código de Cliente
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={cliente.codigoCliente || ''}
                  onChange={(e) => handleClienteChange('codigoCliente', e.target.value)}
                  placeholder="Código"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Sección de Búsqueda Mejorada */}
        <section className="glass-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Productos
            </h2>
            
            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3">
              <Tooltip content="Seleccionar productos por línea de catálogo">
                <button
                  onClick={() => setLineModalOpen(true)}
                  className="btn btn-secondary"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Elegir línea
                </button>
              </Tooltip>
              
              <Tooltip content="Agregar producto manualmente cuando no se encuentra en el catálogo">
                <button
                  onClick={handleAgregarManual}
                  disabled={!canAddManually}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Manualmente
                </button>
              </Tooltip>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
              <span className="ml-3 text-[var(--text-secondary)]">Cargando catálogo...</span>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--text-tertiary)]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por código, EAN o nombre del producto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                  clearSearchSelection();
                }}
                onFocus={() => {
                  setShowResults(true);
                  clearSearchSelection();
                }}
                className="input pl-12 pr-4 py-4 text-lg w-full rounded-xl border-2 border-[var(--border-primary)] focus:border-[var(--color-primary)] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowResults(false);
                    clearSearchSelection();
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              
              {/* Resultados de búsqueda - Renderizado con portal para evitar problemas de z-index */}
              {showResults && searchTerm && (
                displayedResults.length > 0 ? (
                  createPortal(
                    <div 
                      className="fixed bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl shadow-2xl max-h-96 overflow-y-auto"
                      style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '600px',
                        zIndex: 99999,
                      }}
                    >
                      {/* Cabecera con selección múltiple */}
                      <div className="sticky top-0 bg-[var(--surface-elevated)] border-b border-[var(--border-primary)] p-3 z-10">
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)] font-medium text-sm">
                            <input
                              type="checkbox"
                              checked={selectedSearchResults.size === displayedResults.length && displayedResults.length > 0}
                              onChange={toggleSelectAllSearchResults}
                              className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            />
                            <span>Seleccionar todos ({displayedResults.length})</span>
                          </label>
                          {selectedSearchResults.size > 0 && (
                            <button
                              onClick={addSelectedSearchResults}
                              className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Agregar {selectedSearchResults.size}</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <ul className="divide-y divide-[var(--border-secondary)]">
                        {displayedResults.map((p) => {
                          const isAlreadyAdded = productos.some(prod => prod.codigo === p.codigo);
                          return (
                          <li
                            key={p.codigo}
                            onClick={() => !isAlreadyAdded && toggleSearchResultSelection(p.codigo)}
                            className={`p-4 cursor-pointer transition-colors group ${
                              selectedSearchResults.has(p.codigo)
                                ? 'bg-[var(--color-primary)]/10'
                                : isAlreadyAdded
                                  ? 'bg-[var(--color-warning)]/5 opacity-60'
                                  : 'hover:bg-[var(--bg-tertiary)]'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedSearchResults.has(p.codigo)}
                                  disabled={isAlreadyAdded}
                                  onChange={() => toggleSearchResultSelection(p.codigo)}
                                  className={`mt-1 w-4 h-4 rounded border-[var(--border-primary)] focus:ring-[var(--color-primary)] ${isAlreadyAdded ? 'cursor-not-allowed' : 'text-[var(--color-primary)]'}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                                    {p.nombre}
                                    {isAlreadyAdded && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-warning)]/20 text-[var(--color-warning)] text-xs font-medium">
                                        <AlertCircle className="w-3 h-3" />
                                        Ya seleccionado
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                      <Tag className="w-3 h-3" />
                                      {p.codigo}
                                    </span>
                                    {p.cod_ean && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                        Código: {p.cod_ean}
                                      </span>
                                    )}
                                    {p.linea && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                        {p.linea}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {p.precio_referencial && p.precio_referencial > 0 && (
                                <div className="text-right ml-4">
                                  <div className="text-xs text-[var(--text-tertiary)]">Precio Ref.</div>
                                  <div className="font-bold text-[var(--color-success)]">
                                    S/ {p.precio_referencial.toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </li>
                        );})}
                      </ul>
                    </div>,
                    document.body
                  )
                ) : (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 p-4 bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl shadow-lg">
                    <div className="text-center py-4">
                      <Package className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-3" />
                      <p className="text-[var(--text-secondary)]">
                        No se encontraron productos para "{searchTerm}"
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Usa "Agregar Manualmente" si deseas crear este producto
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
        
        {/* Controles Globales */}
        <section className="glass-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Aplicar Globalmente</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Aplica el mismo porcentaje a {productos.filter(p => p.costo !== null).length} producto(s) con costo
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Margen Global */}
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <label className="text-sm font-medium text-purple-700 dark:text-purple-400 min-w-fit">Margen:</label>
                <PriceInputEnhanced
                  value={margenGlobal}
                  onChange={(valor) => setMargenGlobal(valor ?? 0)}
                  type="margen"
                  showPercent
                  size="sm"
                />
                <button
                  onClick={handleAplicarMargenGlobal}
                  disabled={productos.filter(p => p.costo !== null).length === 0}
                  className="btn btn-primary text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Aplica el margen a todos los productos con costo"
                >
                  Aplicar
                </button>
              </div>
              
              {/* Markup Global */}
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <label className="text-sm font-medium text-blue-700 dark:text-blue-400 min-w-fit">Markup:</label>
                <PriceInputEnhanced
                  value={markupGlobal}
                  onChange={(valor) => setMarkupGlobal(valor ?? 0)}
                  type="markup"
                  showPercent
                  size="sm"
                />
                <button
                  onClick={handleAplicarMarkupGlobal}
                  disabled={productos.filter(p => p.costo !== null).length === 0}
                  className="btn btn-primary text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Aplica el markup a todos los productos con costo"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tabla de Productos con Encabezados Coloreados */}
        <section className="glass-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Productos ({productos.length})
            </h2>
            
            <div className="flex gap-3">
              <button
                onClick={handleLimpiarTodo}
                disabled={productos.length === 0}
                className="btn btn-danger"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpiar
              </button>
              <button
                onClick={handleExportar}
                disabled={productos.length === 0}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </button>
            </div>
          </div>
          
          {productos.length > 0 ? (
            <>
              {/* Vista de tarjetas para móvil (< 768px) - Ajuste 5 */}
              <div className="block md:hidden space-y-3">
                {productos.map((producto) => (
                  <MarginProductCard
                    key={producto.codigo}
                    producto={producto}
                    onUpdateCampo={(campo, valor) => handleUpdateCampo(producto.codigo, campo, valor)}
                    onEliminar={() => handleEliminarProducto(producto.codigo)}
                  />
                ))}
              </div>

              {/* Vista de tabla para escritorio (>= 768px) - Ajuste 4 */}
              <div className="hidden md:block space-y-4">
                {/* Buscador y ordenamiento de tabla */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                      <input
                        type="text"
                        placeholder="Buscar por código o nombre..."
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Ordenar por:</label>
                    <select
                      value={tableSortBy}
                      onChange={(e) => setTableSortBy(e.target.value as 'codigo' | 'nombre' | 'costo' | 'precio')}
                      className="px-3 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                      <option value="codigo">Código</option>
                      <option value="nombre">Nombre</option>
                      <option value="costo">Costo</option>
                      <option value="precio">Precio</option>
                    </select>
                  </div>
                  
                  {tableSearch && (
                    <div className="text-sm text-[var(--text-secondary)]">
                      {productosOrdenados.length} de {productos.length}
                    </div>
                  )}
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto rounded-xl border border-[var(--border-primary)] shadow-lg">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="bg-gray-500 text-white font-semibold px-4 py-3 text-sm text-left cursor-pointer hover:bg-gray-600" onClick={() => setTableSortBy('codigo')} title="Clic para ordenar">
                          Código {tableSortBy === 'codigo' && '↓'}
                        </th>
                        <th className="bg-gray-500 text-white font-semibold px-4 py-3 text-sm text-left cursor-pointer hover:bg-gray-600" onClick={() => setTableSortBy('nombre')} title="Clic para ordenar">
                          Producto {tableSortBy === 'nombre' && '↓'}
                        </th>
                        <ColoredHeader type="costo" icon={<DollarSign className="w-4 h-4" />}>
                          Costo
                        </ColoredHeader>
                        <ColoredHeader type="precio" icon={<DollarSign className="w-4 h-4" />}>
                          Precio
                        </ColoredHeader>
                        <ColoredHeader type="markup" icon={<TrendingUp className="w-4 h-4" />} tooltip="(Precio - Costo) / Costo × 100">
                          Markup
                        </ColoredHeader>
                        <ColoredHeader type="margen" icon={<Percent className="w-4 h-4" />} tooltip="(Precio - Costo) / Precio × 100">
                          Margen
                        </ColoredHeader>
                        <ColoredHeader type="ganancia">
                          Ganancia
                        </ColoredHeader>
                        <th className="bg-gray-600 text-white font-semibold px-4 py-3 text-sm text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosOrdenados.length > 0 ? (
                        productosOrdenados.map((producto) => (
                          <MarginRow
                            key={producto.codigo}
                            producto={producto}
                            onUpdateCampo={(campo, valor) => handleUpdateCampo(producto.codigo, campo, valor)}
                            onEliminar={() => handleEliminarProducto(producto.codigo)}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                            No hay productos que coincidan con "{tableSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 px-4 rounded-xl border-2 border-dashed border-[var(--border-secondary)] bg-[var(--bg-tertiary)]/30">
              <Calculator className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Sin productos</h3>
              <p className="mt-2 text-[var(--text-secondary)] max-w-md mx-auto">
                Busca productos arriba para agregarlos a la calculadora
              </p>
            </div>
          )}
        </section>
        
        {/* Información de Ayuda */}
        <section className="glass-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">💡 Cómo usar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--text-secondary)]">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Fórmulas:</h3>
              <ul className="space-y-1">
                <li><strong>Markup:</strong> (Precio - Costo) / Costo × 100</li>
                <li><strong>Margen:</strong> (Precio - Costo) / Precio × 100</li>
                <li><strong>Ganancia:</strong> Precio - Costo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Tips:</h3>
              <ul className="space-y-1">
                <li>• Al hacer clic en un campo, se selecciona todo el número</li>
                <li>• Escribe directamente el nuevo valor (ej: 12.50)</li>
                <li>• Los campos calculados se bloquean 🔒</li>
              </ul>
            </div>
          </div>
        </section>
        
      </div>
      
      {/* Modal de Selección por Línea */}
      <Modal
        isOpen={lineModalOpen}
        onClose={() => setLineModalOpen(false)}
        title="Seleccionar productos por línea"
        size="lg"
      >
        <div className="space-y-6">
          {/* Paso 1: Selección de línea */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Línea de productos
            </label>
            <select
              value={selectedLinea}
              onChange={(e) => {
                setSelectedLinea(e.target.value);
                setSelectedCodigos(new Set());
              }}
              className="w-full px-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              <option value="">Seleccione una línea</option>
              {lineas.map((linea) => (
                <option key={linea} value={linea}>
                  {linea}
                </option>
              ))}
            </select>
          </div>

          {/* Paso 2: Búsqueda y selección de productos */}
          {selectedLinea && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Buscar productos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre..."
                    value={searchNombre}
                    onChange={(e) => setSearchNombre(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto border border-[var(--border-primary)] rounded-lg">
                <DataTable
                  data={productosDeLinea}
                  columns={lineModalColumns}
                  noDataMessage="No hay productos para la línea seleccionada con el filtro actual."
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Acciones del modal */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-primary)]">
          <button
            onClick={() => setLineModalOpen(false)}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmLineSelection}
            disabled={!selectedLinea || selectedCodigos.size === 0}
            className="btn btn-primary"
          >
            Agregar seleccionados ({selectedCodigos.size})
          </button>
        </div>
      </Modal>

      {/* Modal de Aplicación Global - Ajuste 2 */}
      <Modal
        isOpen={globalApplyModal !== null}
        onClose={() => setGlobalApplyModal(null)}
        title={globalApplyModal === 'margen' ? 'Aplicar Margen Globalmente' : 'Aplicar Markup Globalmente'}
        size="md"
      >
        <div className="space-y-6">
          {/* Información */}
          <div className={`p-4 rounded-lg ${globalApplyModal === 'margen' 
            ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800' 
            : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${globalApplyModal === 'margen' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} />
              <div>
                <p className="font-semibold text-[var(--text-primary)] mb-1">
                  Se aplicará {globalApplyModal === 'margen' ? `Margen ${margenGlobal}%` : `Markup ${markupGlobal}%`}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Se actualizarán <strong>{productos.filter(p => p.costo !== null).length}</strong> producto(s) con costo definido
                </p>
              </div>
            </div>
          </div>

          {/* Preview de cambios */}
          <div className="max-h-64 overflow-y-auto border border-[var(--border-secondary)] rounded-lg p-4 space-y-2">
            {productos.filter(p => p.costo !== null).slice(0, 5).map((p) => (
              <div key={p.codigo} className="text-sm flex justify-between items-center py-2 border-b border-[var(--border-secondary)] last:border-b-0">
                <div>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">{p.codigo}</span>
                  <span className="text-[var(--text-secondary)] ml-2 truncate max-w-xs">{p.nombre}</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-[var(--text-tertiary)]">→</span>
                  <span className="font-semibold text-[var(--color-primary)]">
                    {globalApplyModal === 'margen' 
                      ? `${margenGlobal.toFixed(1)}%` 
                      : `${markupGlobal.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            ))}
            {productos.filter(p => p.costo !== null).length > 5 && (
              <div className="text-sm text-[var(--text-tertiary)] text-center py-2">
                ... y {productos.filter(p => p.costo !== null).length - 5} más
              </div>
            )}
          </div>

          {/* Mensaje de advertencia si hay productos sin costo */}
          {productos.some(p => p.costo === null) && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
              ⚠️ {productos.filter(p => p.costo === null).length} producto(s) sin costo no serán afectados
            </div>
          )}
        </div>

        {/* Acciones del modal */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-primary)]">
          <button
            onClick={() => setGlobalApplyModal(null)}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={confirmGlobalApply}
            className={`btn btn-primary ${globalApplyModal === 'margen' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {globalApplyModal === 'margen' ? <Percent className="w-4 h-4 mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
            Aplicar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MarginCalculatorPage;
