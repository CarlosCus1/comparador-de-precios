import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { ModuleType } from '../enums';

interface ExportOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedColumns: string[], format: 'xlsx') => void;
    initialSelectedColumns?: string[];
}

export const EXPORT_COLUMN_GROUPS = [
    {
        id: 'basic_info',
        label: 'Información del Producto',
        columns: [
            { id: 'codigo', label: 'Código' },
            { id: 'ean13', label: 'EAN13' },
            { id: 'ean14', label: 'EAN14' },
            { id: 'nombre', label: 'Nombre Producto' },
        ]
    },
    {
        id: 'brand_base',
        label: 'Marca Base (M1)',
        columns: [
            { id: 'm1_precio', label: 'Precio Base' },
        ]
    },
    ...[2, 3, 4, 5].map(n => ({
        id: `m${n}_data`,
        label: `Competidor M${n}`,
        columns: [
            { id: `m${n}_precio`, label: `M${n} - Precio` },
            { id: `m${n}_dif`, label: `M${n} - Diferencia` },
            { id: `m${n}_pct`, label: `M${n} - Porcentaje` },
        ]
    })),
    {
        id: 'price_stats',
        label: 'Estadísticas de Precio',
        columns: [
            { id: 'min_max', label: 'Mínimo y Máximo' },
            { id: 'avg_stdev', label: 'Promedio y Desv. Estándar' },
            { id: 'dispersion', label: 'Dispersión (CV)' },
        ]
    },
    {
        id: 'suggested',
        label: 'Precio Sugerido',
        columns: [
            { id: 'sugerido_precio', label: 'Precio Sugerido' },
            { id: 'sugerido_ranking', label: 'Ranking Sugerido' },
        ]
    },
    {
        id: 'kpis',
        label: 'KPIs Comparativos',
        columns: [
            { id: 'vs_prom', label: '% vs Promedio' },
            { id: 'vs_min', label: '% vs Mínimo' },
            { id: 'vs_max', label: '% vs Máximo' },
            { id: 'count_competitors', label: 'Conteo Competidores' },
            { id: 'count_cheaper_expensive', label: 'Conteo +Baratos / +Caros' },
            { id: 'ranking', label: 'Ranking' },
        ]
    }
];

// IDs de columnas que el backend reconoce
export const BACKEND_COLUMN_IDS = [
    'codigo', 'ean13', 'ean14', 'nombre', 'm1_precio',
    ...[2, 3, 4, 5].flatMap(n => [`m${n}_precio`, `m${n}_dif`, `m${n}_pct`]),
    'min_max', 'avg_stdev', 'dispersion',
    'sugerido_precio', 'sugerido_ranking',
    'vs_prom', 'vs_min', 'vs_max',
    'count_competitors', 'count_cheaper_expensive', 'ranking'
];

const ALL_COLUMN_IDS = BACKEND_COLUMN_IDS;

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialSelectedColumns
}) => {
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        initialSelectedColumns || ALL_COLUMN_IDS
    );
    const [activePreset, setActivePreset] = useState<'basic' | 'complete' | null>(null);

    const handleToggleColumn = (id: string) => {
        setSelectedColumns(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleToggleGroup = (groupId: string) => {
        const group = EXPORT_COLUMN_GROUPS.find(g => g.id === groupId);
        if (!group) return;

        const groupColumnIds = group.columns.map(c => c.id);
        const allSelected = groupColumnIds.every(id => selectedColumns.includes(id));

        if (allSelected) {
            setSelectedColumns(prev => prev.filter(id => !groupColumnIds.includes(id)));
        } else {
            setSelectedColumns(prev => [...new Set([...prev, ...groupColumnIds])]);
        }
    };

    const handleSelectAll = () => {
        setSelectedColumns(ALL_COLUMN_IDS);
    };

    const handleSelectNone = () => {
        setSelectedColumns([]);
    };

    const handleApplyBasicPreset = () => {
        const basicGroups = ['basic_info', 'brand_base', ...[2, 3, 4, 5].map(n => `m${n}_data`)];
        const basicColumns = EXPORT_COLUMN_GROUPS
            .filter(g => basicGroups.includes(g.id))
            .flatMap(g => g.columns.map(c => c.id));
        setSelectedColumns(basicColumns);
        setActivePreset('basic');
    };

    const handleApplyCompletePreset = () => {
        setSelectedColumns(ALL_COLUMN_IDS);
        setActivePreset('complete');
    };


    const handleConfirm = (format: 'xlsx') => {
        onConfirm(selectedColumns, format);
        onClose();
    };

    const actions = (
        <>
            <button onClick={onClose} className="btn btn-ghost">
                Cancelar
            </button>
            <button
                onClick={() => handleConfirm('xlsx')}
                className="btn btn-primary"
                disabled={selectedColumns.length === 0}
            >
                Exportar a Excel
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Opciones de Exportación"
            size="lg"
            module={ModuleType.COMPARADOR}
            actions={actions}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-[var(--bg-tertiary)] p-4 rounded-xl border border-[var(--border-primary)]">
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Selecciona las columnas que deseas incluir en el reporte.
                        </p>
                        <p className="text-xs font-bold mt-1 text-[var(--color-comparador-primary)]">
                            {selectedColumns.length} columnas seleccionadas
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSelectAll} className="text-xs font-bold uppercase tracking-wider text-[var(--color-comparador-primary)] hover:underline">
                            Todos
                        </button>
                        <span className="text-[var(--border-primary)]">|</span>
                        <button onClick={handleSelectNone} className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:underline">
                            Ninguno
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleApplyBasicPreset}
                        className={`flex-1 btn btn-ghost border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] ${activePreset === 'basic' ? 'bg-[var(--color-comparador-primary)] text-white' : 'text-[var(--text-primary)]'}`}
                        title="Incluye información básica: códigos, nombres, precios y diferencias"
                    >
                        Básico
                    </button>
                    <button
                        onClick={handleApplyCompletePreset}
                        className={`flex-1 btn btn-ghost border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] ${activePreset === 'complete' ? 'bg-[var(--color-comparador-primary)] text-white' : 'text-[var(--text-primary)]'}`}
                        title="Incluye todas las columnas disponibles para análisis completo"
                    >
                        Completo
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {EXPORT_COLUMN_GROUPS.map(group => {
                        const groupColumnIds = group.columns.map(c => c.id);
                        const selectedInGroup = groupColumnIds.filter(id => selectedColumns.includes(id));
                        const isAllSelected = selectedInGroup.length === groupColumnIds.length;
                        const isSomeSelected = selectedInGroup.length > 0 && !isAllSelected;

                        return (
                            <div key={group.id} className="space-y-3 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)]">
                                <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-2">
                                    <h3 className="font-bold text-[var(--text-primary)]">{group.label}</h3>
                                    <button
                                        onClick={() => handleToggleGroup(group.id)}
                                        className={`text-xs font-bold px-2 py-1 rounded transition-colors ${isAllSelected
                                            ? 'bg-[var(--color-comparador-primary)]/10 text-[var(--color-comparador-primary)]'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                            }`}
                                        title={`${isAllSelected ? 'Desmarcar' : 'Marcar'} todas las columnas de ${group.label.toLowerCase()}`}
                                    >
                                        {isAllSelected ? 'Desmarcar Grupo' : 'Marcar Grupo'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {group.columns.map(column => (
                                        <label
                                            key={column.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedColumns.includes(column.id)}
                                                onChange={() => handleToggleColumn(column.id)}
                                                className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--color-comparador-primary)] focus:ring-[var(--color-comparador-primary)]"
                                            />
                                            <span className="text-sm text-[var(--text-primary)]">{column.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
};
