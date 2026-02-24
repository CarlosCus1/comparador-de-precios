import React from 'react';

interface MiniPriceChartProps {
    prices: { label: string; value: number | null }[];
}

/**
 * MiniPriceChart Component
 * 
 * Renders a small, elegant bar chart to compare prices between different brands.
 * Designed to fit perfectly within a table cell.
 */
export const MiniPriceChart: React.FC<MiniPriceChartProps> = ({ prices }) => {
    // Filter out null or zero prices for calculation
    const validPrices = prices.filter((p) => p.value !== null && p.value > 0) as { label: string; value: number }[];

    if (validPrices.length === 0) {
        return <div className="h-8 flex items-center justify-center text-[var(--text-tertiary)] text-[10px] italic">Sin datos</div>;
    }

    // Find max price to normalize bar heights
    const maxPrice = Math.max(...validPrices.map((p) => p.value));

    // Find min and max prices to highlight cheapest and most expensive
    const minPrice = Math.min(...validPrices.map((p) => p.value));
    const maxPriceValue = Math.max(...validPrices.map((p) => p.value));

    return (
        <div className="flex items-end gap-1 h-10 w-28 bg-[var(--bg-tertiary)]/30 p-1 rounded-md border border-[var(--border-secondary)]/50 group">
            {prices.map((p, idx) => {
                const value = p.value || 0;
                const height = maxPrice > 0 ? (value / maxPrice) * 100 : 0;

                // Styling logic
                const isBase = idx === 0;
                const isCheapest = value === minPrice && validPrices.length > 1;
                const isMostExpensive = value === maxPriceValue && validPrices.length > 1 && !isBase;

                let barColor = 'bg-[var(--text-tertiary)] opacity-40';
                if (isBase) {
                    barColor = 'bg-gradient-to-t from-[var(--color-comparador-primary)] to-[var(--color-comparador-secondary)]';
                } else if (isCheapest) {
                    barColor = 'bg-gradient-to-t from-[var(--color-success)] to-[var(--color-success)]/70';
                } else if (isMostExpensive) {
                    barColor = 'bg-gradient-to-t from-red-300 to-red-200';
                }

                return (
                    <div
                        key={idx}
                        className="relative flex-1 group/bar"
                        style={{ height: '100%' }}
                    >
                        <div
                            className={`absolute bottom-0 w-full rounded-t-[2px] transition-all duration-500 ease-out ${barColor} ${isBase ? 'opacity-100' : 'group-hover:opacity-80'}`}
                            style={{ height: `${height}%` }}
                        />

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block z-10">
                            <div className="bg-[var(--surface-elevated)] text-[var(--text-primary)] text-[10px] py-1 px-2 rounded shadow-lg border border-[var(--border-primary)] whitespace-nowrap font-bold">
                                {p.label}: {value > 0 ? `S/ ${value.toFixed(2)}` : 'N/A'}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
