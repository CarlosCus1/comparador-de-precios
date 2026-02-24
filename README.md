# Comparador de Precios — Resumen rápido

Esta rama contiene la versión localmente probada del comparador de precios con mejoras en la exportación PNG/XLSX, ajustes visuales en la tabla de comparación y correcciones de lint/typos importantes.

Últimos cambios relevantes:
- Corrección de errores de compilación en `ComparadorPage` y estabilización del flujo de exportación PNG (aplica `.export-mode` al clonado antes de capturar).
- Ajustes visuales: encabezados en dos líneas, ocultado de columnas `EAN` y `Acciones` en exportaciones, símbolo de moneda separado para ocultarlo en PNG.
- Mejora en `PriceInput` y consistencia de tamaños en la tabla.
- Correcciones parciales en `pyExcelGenerator` y en `PyExcelExportButton` para reducir warnings.

Cómo ejecutar (desarrollo):

```bash
npm install
npm run dev
```

Exportación:
- Para generar PNG desde la UI use el botón de exportar image/PNG en la página "Comparador".
- Para Excel se usan dos mecanismos: exportación por backend (legacy) y exportación en navegador con Pyodide cuando está disponible.

Estado actual:
- Build local: OK después de los fixes aplicados.
- Quedan advertencias/lints menores que se pueden limpiar en un siguiente pase.

Si quieres que empuje esta versión como `main` o a la rama remota actual, confirmamelo y haré el push.

---
Fecha de actualización: 2026-02-23
