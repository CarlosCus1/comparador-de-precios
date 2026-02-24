import React from 'react';
import { getBrandColor } from '../../utils/colorScheme';

export const ColorTest: React.FC = () => {
  const testBrands = [
    'Mi Marca',
    'Competidor 1', 
    'Competidor 2',
    'Competidor 3',
    'Competidor 4',
    'Competidor 5'
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4">Prueba de Colores del Esquema</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {testBrands.map(brand => {
          const color = getBrandColor(brand);
          return (
            <div key={brand} className="flex flex-col items-center space-y-2">
              <div
                className="w-16 h-16 rounded-lg shadow-lg border-2 border-white"
                style={{ backgroundColor: color }}
              />
              <div className="text-center text-sm">
                <div className="font-semibold">{brand}</div>
                <div className="text-grey-600">{color}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};