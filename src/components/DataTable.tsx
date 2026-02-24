// --------------------------------------------------------------------------- #
//                                                                             #
//              src/components/DataTable.tsx (Refactorizado)                   #
//                                                                             #
// --------------------------------------------------------------------------- #

// --- 1. Importaciones necesarias ---
import React, { useState } from 'react';
import { Tooltip } from './ui/Tooltip';

// --- 2. Definición de las Props del Componente ---
export interface IColumn<T> {
  key?: string;
  header: React.ReactNode;
  accessor: keyof T | (string & {});
  cellRenderer?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  cellClassName?: string;
  headerClassName?: string; // Nuevo: Clases para el encabezado (th)
  tooltip?: string; // Nuevo: Tooltip para el encabezado
  sortable?: boolean; // Nuevo: Indicador de si es ordenable
  onSort?: (key: string) => void; // Nuevo: Callback para ordenar
}

interface Props<T> {
  data: T[];
  columns: IColumn<T>[];
  noDataMessage?: string;
  compact?: boolean;
  colClasses?: string[];
  tableClassName?: string;
  selectable?: boolean; // Nuevo: Habilitar selección de filas
  selectedIds?: Set<string>; // Nuevo: IDs seleccionados
  onSelectionChange?: (ids: Set<string>) => void; // Nuevo: Callback de selección
  expandable?: boolean; // Nuevo: Habilitar filas expandibles
  renderExpansion?: (row: T) => React.ReactNode; // Nuevo: Renderizado de la expansión
}

/**
 * Componente DataTable Genérico Mejorado
 */
export const DataTable = <T extends { codigo: string }>({
  data = [],
  columns,
  noDataMessage = 'No hay productos en la lista.',
  compact = false,
  striped = true,
  colClasses = [],
  tableClassName = '',
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  expandable = false,
  renderExpansion
}: Props<T> & { striped?: boolean }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(new Set(data.map(d => d.codigo)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    onSelectionChange(newSelected);
  };

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-[var(--border-primary)] bg-[var(--surface-primary)] shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className={`min-w-full divide-y divide-[var(--border-primary)] ${compact ? 'table-compact' : ''} ${striped ? 'table-striped' : ''} ${tableClassName}`}>
          {colClasses.length > 0 && (
            <colgroup>
              {(selectable || expandable) && <col className="w-10" />}
              {colClasses.map((c, idx) => (
                <col key={idx} className={c} />
              ))}
            </colgroup>
          )}

          <thead className="bg-[var(--bg-tertiary)]">
            <tr>
              {(selectable || expandable) && (
                <th className="px-2 py-2 text-center w-10">
                  {selectable && (
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-[var(--color-comparador-primary)] rounded border-[var(--border-primary)] bg-[var(--surface-primary)] focus:ring-[var(--color-comparador-primary)] transition-all"
                    />
                  )}
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={`${column.header}-${String(column.accessor)}`}
                  className={`px-2 py-2 text-${column.align || 'left'} text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] group ${column.sortable ? 'cursor-pointer hover:bg-[var(--bg-tertiary)]/50' : ''} ${column.headerClassName || ''}`}
                  onClick={column.sortable ? () => column.onSort?.(String(column.accessor)) : undefined}
                >
                  <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                    {column.tooltip ? (
                      <Tooltip content={column.tooltip}>
                        <span className="cursor-help border-b border-dotted border-[var(--text-tertiary)]">
                          {column.header}
                        </span>
                      </Tooltip>
                    ) : (
                      <span>{column.header}</span>
                    )}
                    {column.sortable && (
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-primary)] bg-[var(--surface-primary)]">
            {data.length > 0 ? (
              data.map((row) => {
                const isExpanded = expandedRows.has(row.codigo);
                const isSelected = selectedIds.has(row.codigo);

                return (
                  <React.Fragment key={row.codigo}>
                    <tr className={`
                      transition-all duration-200 
                      ${isSelected ? 'bg-[var(--color-comparador-primary)]/5' : 'hover:bg-[var(--bg-tertiary)]'}
                      ${isExpanded ? 'bg-[var(--bg-tertiary)]/50' : ''}
                    `}>
                      {(selectable || expandable) && (
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {expandable && (
                              <button
                                onClick={() => toggleExpand(row.codigo)}
                                className={`p-1 rounded-full hover:bg-[var(--border-primary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              >
                                <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                            {selectable && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleSelectItem(row.codigo, e.target.checked)}
                                className="form-checkbox h-4 w-4 text-[var(--color-comparador-primary)] rounded border-[var(--border-primary)] bg-[var(--surface-primary)] focus:ring-[var(--color-comparador-primary)] transition-all"
                              />
                            )}
                          </div>
                        </td>
                      )}
                      {columns.map((column, colIndex) => (
                        <td key={`${String(column.accessor)}-${colIndex}`} className={`px-2 py-2 break-words text-sm text-[var(--text-primary)] text-${column.align || 'left'} ${column.cellClassName || ''}`}>
                          {column.cellRenderer
                            ? column.cellRenderer(row)
                            : String(row[column.accessor as keyof T] ?? '')}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && renderExpansion && (
                      <tr className="bg-[var(--bg-tertiary)]/30 animate-fade-in">
                        <td colSpan={columns.length + 1} className="px-8 py-4 border-l-4 border-[var(--color-comparador-primary)]">
                          {renderExpansion(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-10 text-[var(--text-tertiary)]">
                  {noDataMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
