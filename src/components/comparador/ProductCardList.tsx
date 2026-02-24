import React from 'react';
import type { IProductoEditado } from '../../interfaces';
import { ProductCard } from './ProductCard';
import { Box, Typography } from '@mui/material';

type ComparisonTableRow = IProductoEditado & Record<string, string | number | undefined>;

interface ProductCardListProps {
  products: ComparisonTableRow[];
  onDelete: (codigo: string) => void;
  competidores: string[];
  handlePriceChange: (codigo: string, competidor: string, valor: number | null) => void;
  getPercentageCellClass: (value: string | undefined, columnType: 'competitor' | 'sugerido') => string;
}

export const ProductCardList: React.FC<ProductCardListProps> = ({ products, onDelete, competidores, handlePriceChange, getPercentageCellClass }) => {
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography color="text.secondary">No hay productos en la lista.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {products.map((product) => (
        <ProductCard 
          key={product.codigo} 
          product={product} 
          onDelete={onDelete}
          competidores={competidores}
          handlePriceChange={handlePriceChange}
          getPercentageCellClass={getPercentageCellClass}
        />
      ))}
    </Box>
  );
};
