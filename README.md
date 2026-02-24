# CIPSA Análisis de Precios - Sistema de Comparación Competitiva

Una aplicación web moderna para el análisis comparativo de precios entre múltiples competidores y cálculo de márgenes comerciales.

## 🌐 Demo en Vivo

**GitHub Pages**: https://carloscus1.github.io/comparador-de-precios/

> **Nota**: La versión de GitHub Pages es una **demo estática** que funciona sin backend. Para funcionalidad completa con backend, ver instrucciones de desarrollo local.

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- Login seguro con validación de dominio corporativo (@cipsa.com.pe)
- Gestión de sesiones con timeout automático
- Protección de rutas y datos sensibles

### 📊 Análisis Comparativo Avanzado
- **Catálogo Inteligente**: Carga automática con búsqueda en tiempo real
- **Comparación Interactiva**: Tabla editable con cálculos automáticos de porcentajes y rankings
- **Visualizaciones Dinámicas**: Gráficos de barras, pastel y tendencias con colores sincronizados
- **Tarjetas Comparativas**: Layout horizontal responsive con métricas clave

### 🎨 Sistema de Diseño Premium
- **Paleta Corporativa**: Verde esmeralda como color principal con gradientes elegantes
- **Colores Sincronizados**: Sistema unificado para marcas, gráficos y componentes
- **Interfaz Moderna**: Diseño glassmorphism con efectos de sombra y animaciones sutiles
- **Accesibilidad WCAG AA**: Contraste optimizado y navegación por teclado
- **Responsive Design**: Adaptable a desktop, tablet y móvil

### 📈 Exportación y Reportes
- **Múltiples Formatos**: Excel, PDF y PNG con opciones avanzadas
- **Reportes Personalizables**: Selección de columnas y métricas
- **Visuales de Alta Calidad**: Gráficos exportables con branding consistente

## 🛠️ Tecnologías

### Frontend
- **React 19** + **TypeScript** - Framework moderno con tipado fuerte
- **Vite** - Build tool ultrarrápido con HMR
- **Tailwind CSS** - Framework CSS utility-first con extensiones personalizadas
- **Material-UI (MUI)** - Componentes avanzados con tema personalizado
- **Recharts** - Librería de gráficos declarativa y flexible
- **Zustand** - Gestión de estado ligera con persistencia
- **React Hook Form** - Formularios con validación optimizada

### Backend (Opcional - Solo para desarrollo local)
- **Python Flask** - API REST ligera y escalable
- **Pandas** - Procesamiento de datos y generación de reportes
- **OpenPyXL** - Manipulación de archivos Excel

## 🚀 Instalación y Configuración

### Versión Estática (GitHub Pages)
Simplemente visita la URL de demo: https://carloscus1.github.io/comparador-de-precios/

### Desarrollo Local Completo

#### Prerrequisitos
- Node.js 18+
- Python 3.8+ (solo si necesitas backend)
- npm o yarn

#### Instalación Frontend
```bash
# Clonar repositorio
git clone https://github.com/CarlosCus1/comparador-de-precios.git
cd comparador-de-precios

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (sin backend)
npm run dev
```

#### Instalación Backend (Opcional)
```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python app.py
```

#### Ejecución Completa con Backend
```bash
# Terminal 1: Backend (opcional)
cd backend && python app.py

# Terminal 2: Frontend
npm run dev
```

## 🎯 Uso

1. **Autenticación**: Inicia sesión con tu email corporativo
2. **Búsqueda**: Utiliza la búsqueda inteligente para encontrar productos
3. **Selección**: Agrega productos a la lista de comparación
4. **Análisis**: Ingresa precios de competidores y visualiza métricas
5. **Exportación**: Genera reportes en múltiples formatos

## 🎨 Sistema de Diseño Detallado

### Paleta de Colores
- **Primario**: Verde esmeralda (#059669)
- **Secundario**: Azul profundo (#2563EB)
- **Accent**: Púrpura amatista (#7C3AED)
- **Marcas**: Colores únicos asignados dinámicamente por nombre
- **Estados**: Success (#10B981), Warning (#F59E0B), Danger (#DC2626)

### Componentes UI
- **Botones**: Gradientes corporativos con hover mejorado y animaciones
- **Tarjetas**: Efectos glassmorphism con sombras dinámicas
- **Formularios**: Campos con validación visual y estados interactivos
- **Gráficos**: Colores sincronizados con paleta de marcas

### Layout y Responsive
- **Desktop**: Layout horizontal con sidebar y contenido principal
- **Tablet/Móvil**: Diseño apilado con navegación colapsable
- **Tarjetas Comparativas**: Horizontal en PC, vertical en móvil

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Button, Modal, etc.)
│   ├── charts/         # Gráficos y visualizaciones
│   ├── comparador/     # Lógica de comparación
│   └── ...
├── pages/              # Páginas principales
├── hooks/              # Hooks personalizados
├── utils/              # Utilidades y helpers
├── styles/             # CSS y temas
└── types/              # Definiciones TypeScript
```

## 📦 Despliegue

### GitHub Pages (Automático)
El proyecto se despliega automáticamente en GitHub Pages mediante GitHub Actions cuando se hace push a la rama `main`.

- **URL**: https://carloscus1.github.io/comparador-de-precios/
- **Workflow**: `.github/workflows/deploy.yml`

### Build Manual
```bash
npm run build
# Los archivos se generan en la carpeta 'dist'
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de CIPSA. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o consultas, contacta al equipo de desarrollo.
