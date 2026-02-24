import React from 'react';
import type { IProductoEditado } from '../../interfaces';
import { Card, CardContent, Typography, Box, IconButton, Grid } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { PriceInput } from './PriceInput';

type ComparisonTableRow = IProductoEditado & Record<string, string | number | undefined>;

interface ProductCardProps {
  product: ComparisonTableRow;
  competidores: string[];
  handlePriceChange: (codigo: string, competidor: string, valor: number | null) => void;
  getPercentageCellClass: (value: string | undefined, columnType: 'competitor' | 'sugerido') => string;
  onDelete: (codigo: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, competidores, handlePriceChange, getPercentageCellClass, onDelete }) => {
  return (
    <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {product.nombre}
            </Typography>
            <Typography color="text.secondary">
              {product.codigo}
            </Typography>
          </Box>
          <IconButton aria-label="delete" onClick={() => onDelete(product.codigo)}>
            <Delete />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {competidores.map((comp, index) => (
            <Box sx={{ flex: '1 1 45%', minWidth: '150px' }} key={comp}>
              <Typography variant="caption" color="text.secondary">{comp}</Typography>
              <PriceInput
                initialValue={product.precios?.[comp] ?? null}
                onPriceChange={(value) => handlePriceChange(product.codigo, comp, value)}
                competidor={comp}
                item={product}
              />
              {index > 0 && (
                 <Typography variant="caption" className={getPercentageCellClass(product[`% vs ${comp}`] as string, 'competitor')}>
                   {product[`% vs ${comp}`] || 'N/A'}
                 </Typography>
              )}
            </Box>
          ))}

          <Box sx={{ flex: '1 1 45%', minWidth: '150px' }}>
            <Typography variant="caption" color="text.secondary">Precio Sugerido</Typography>
            <PriceInput
              initialValue={product.precio_sugerido ?? null}
              onPriceChange={(value) => handlePriceChange(product.codigo, 'precio_sugerido', value)}
              competidor="Sugerido"
              item={product}
            />
             <Typography variant="caption" className={getPercentageCellClass(product['% Ajuste a Sugerido'] as string, 'sugerido')}>
               {product['% Ajuste a Sugerido'] || 'N/A'}
             </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
