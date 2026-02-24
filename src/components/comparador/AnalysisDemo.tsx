import React from 'react';

export const AnalysisDemo: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4">Demostración de Análisis Individual por Producto</h3>
      <p className="text-sm text-grey-600 mb-4">
        Esta es una vista previa de cómo se vería la sección de análisis individual cuando haya productos en la lista.
      </p>
      <div className="product-analysis-grid-corporate">
        <div className="product-card-corporate" style={{ minHeight: '400px' }}>
          <div className="product-header">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Producto Demostración 1</h3>
                <p className="product-code">Código: PROD001</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--color-comparador-primary)]">
                  S/ 98.00
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border-2 bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  Posición: 1°
                </div>
              </div>
            </div>
          </div>

          <div className="bar-chart-container">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Comparativa de Precios</h4>
            <div className="flex items-end space-x-2" style={{ height: '200px' }}>
              <div className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full rounded-t-lg" style={{ height: '80%', backgroundColor: 'var(--color-mi-marca)', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}></div>
                <div className="mt-2 text-center">
                  <div className="w-3 h-3 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: 'var(--color-mi-marca)' }}></div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">MI</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full rounded-t-lg" style={{ height: '76%', backgroundColor: 'var(--color-competidor-1)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}></div>
                <div className="mt-2 text-center">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--border-secondary)]" style={{ backgroundColor: 'var(--color-competidor-1)' }}></div>
                  <span className="text-xs text-[var(--text-secondary)]">C1</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full rounded-t-lg" style={{ height: '84%', backgroundColor: 'var(--color-competidor-2)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}></div>
                <div className="mt-2 text-center">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--border-secondary)]" style={{ backgroundColor: 'var(--color-competidor-2)' }}></div>
                  <span className="text-xs text-[var(--text-secondary)]">C2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-secondary)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Diferencias Clave</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Mejor vs Competidor 1</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/30 rounded text-xs font-bold">
                    ▼ 5.0%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Peor vs Competidor 2</span>
                  <span className="px-2 py-1 bg-red-500/10 text-red-600 border border-red-500/30 rounded text-xs font-bold">
                    ▲ 5.0%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-secondary)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Resumen</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-[var(--text-secondary)]">Total marcas:</span>
                <span className="font-medium">3</span>
                <span className="text-[var(--text-secondary)]">Precio promedio:</span>
                <span className="font-medium text-[var(--color-comparador-primary)]">
                  S/ 100.00
                </span>
                <span className="text-[var(--text-secondary)]">Precio mínimo:</span>
                <span className="font-medium text-green-600">
                  S/ 95.00
                </span>
                <span className="text-[var(--text-secondary)]">Precio máximo:</span>
                <span className="font-medium text-red-600">
                  S/ 105.00
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span>Click para ver detalles completos</span>
              <div className="w-4 h-4 border-2 border-[var(--border-primary)] rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="product-card-corporate" style={{ minHeight: '400px' }}>
          <div className="product-header">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Producto Demostración 2</h3>
                <p className="product-code">Código: PROD002</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--color-comparador-primary)]">
                  S/ 148.00
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border-2 bg-gradient-to-r from-grey-300 to-grey-500 border-grey-400">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  Posición: 2°
                </div>
              </div>
            </div>
          </div>

          <div className="bar-chart-container">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Comparativa de Precios</h4>
            <div className="flex items-end space-x-2" style={{ height: '200px' }}>
              <div className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full rounded-t-lg" style={{ height: '80%', backgroundColor: 'var(--color-mi-marca)', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}></div>
                <div className="mt-2 text-center">
                  <div className="w-3 h-3 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: 'var(--color-mi-marca)' }}></div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">MI</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full rounded-t-lg" style={{ height: '74.7%', backgroundColor: 'var(--color-competidor-1)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}></div>
                <div className="mt-2 text-center">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--border-secondary)]" style={{ backgroundColor: 'var(--color-competidor-1)' }}></div>
                  <span className="text-xs text-[var(--text-secondary)]">C1</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full rounded-t-lg" style={{ height: '85.3%', backgroundColor: 'var(--color-competidor-2)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}></div>
                <div className="mt-2 text-center">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--border-secondary)]" style={{ backgroundColor: 'var(--color-competidor-2)' }}></div>
                  <span className="text-xs text-[var(--text-secondary)]">C2</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full rounded-t-lg" style={{ height: '78.0%', backgroundColor: 'var(--color-competidor-3)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}></div>
                <div className="mt-2 text-center">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--border-secondary)]" style={{ backgroundColor: 'var(--color-competidor-3)' }}></div>
                  <span className="text-xs text-[var(--text-secondary)]">C3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-secondary)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Diferencias Clave</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Mejor vs Competidor 1</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/30 rounded text-xs font-bold">
                    ▼ 6.7%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Peor vs Competidor 2</span>
                  <span className="px-2 py-1 bg-red-500/10 text-red-600 border border-red-500/30 rounded text-xs font-bold">
                    ▲ 6.7%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-secondary)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Resumen</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-[var(--text-secondary)]">Total marcas:</span>
                <span className="font-medium">4</span>
                <span className="text-[var(--text-secondary)]">Precio promedio:</span>
                <span className="font-medium text-[var(--color-comparador-primary)]">
                  S/ 150.00
                </span>
                <span className="text-[var(--text-secondary)]">Precio mínimo:</span>
                <span className="font-medium text-green-600">
                  S/ 140.00
                </span>
                <span className="text-[var(--text-secondary)]">Precio máximo:</span>
                <span className="font-medium text-red-600">
                  S/ 160.00
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span>Click para ver detalles completos</span>
              <div className="w-4 h-4 border-2 border-[var(--border-primary)] rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};