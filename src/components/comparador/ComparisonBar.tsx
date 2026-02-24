import React from 'react';

interface ComparisonBarProps {
    percentage: string | undefined;
    type: 'competitor' | 'sugerido';
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({ percentage, type }) => {
    if (!percentage || percentage === 'N/A') {
        return <span className="text-[var(--text-tertiary)] text-xs italic">N/A</span>;
    }

    const value = parseFloat(percentage.replace('%', ''));
    if (isNaN(value)) return <span className="text-[var(--text-tertiary)] text-xs italic">N/A</span>;

    // Lógica de colores (igual que en ComparadorPage)
    // Competidor: Negativo es bueno (somos más baratos)
    // Sugerido: Positivo es bueno (estamos por debajo del sugerido)
    const isGood = type === 'competitor' ? value < 0 : value > 0;

    // Normalizar el valor para la barra (máximo 50% para que no se salga)
    const absValue = Math.min(Math.abs(value), 50);
    const width = `${(absValue / 50) * 100}%`;

    const colorClass = isGood
        ? 'bg-[var(--color-success)]'
        : 'bg-[var(--color-danger)]';

    const textColorClass = isGood
        ? 'text-[var(--color-success)]'
        : 'text-[var(--color-danger)]';

    return (
        <div className="flex flex-col gap-1 min-w-[100px]">
            <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${textColorClass}`}>
                    {value > 0 ? '+' : ''}{value.toFixed(2)}%
                </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width }}
                />
            </div>
        </div>
    );
};
