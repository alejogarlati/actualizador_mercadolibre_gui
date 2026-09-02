# 📝 Changelog - Frontend GUI (Desktop Electron)

Todos los cambios notables en la interfaz gráfica, componentes visuales y experiencia de usuario serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.5.0] - 2026-09-02

### 🎨 Rediseño Integral con Design System Anthropic, Unificación UI Multicanal, Modo Oscuro y Resiliencia
- **🏛️ Sistema de Diseño Anthropic (`DESIGN.md`):**
  - Adopción integral de la paleta cálida *Warm Light* (`#faf9f5`, `#141413`) y el modo *Obsidian Charcoal* (`#141413`, `#1c1c1a`, `#262624`).
  - Conmutador interactivo de Tema (☀️ / 🌙) en Header, pie de Sidebar y Hub de Plataformas con persistencia en `localStorage`.
  - Tipografía base refinada a 13px con interlineado 1.45 para legibilidad desktop superior.
- **🧩 Unificación de Componentes Base (Mercado Libre ⚡ & Tiendanube 🛍️):**
  - **Sidebar Colapsable:** Botón de repliegue/expansión persistido en memoria, navegación vertical compacta con tooltips y alineación limpia.
  - **Vistas de Sincronización ERP Homogéneas:** Nueva vista `TiendaNubeSyncView.jsx` con idéntica arquitectura de 2 columnas que `MeliSyncView.jsx` (Carga y parámetros a la izquierda; barra de progreso, métricas en vivo y terminal de logs a la derecha).
  - **Componentes UI Reutilizables:** `Toolbar`, `Table`, `Pagination`, `Modal`, `Badge`, `Button`, `KpiCard`, `Card`, `Tabs`, `Input`, `Select`, `Toast`.
- **📐 Columnas de Tablas Redimensionables Interactivamente:**
  - Control de arrastre horizontal (*drag-to-resize*) con anchos mínimos configurables en todas las tablas del sistema (`Table.jsx`).
- **🎯 Acciones Masivas y Modales:**
  - Isla flotante de acciones en lote en catálogo de Tiendanube con modal para modificación masiva de descuentos o precios (porcentaje, ajuste fijo o precio absoluto).
- **🛡️ Resiliencia y Manejo de Errores:**
  - Nuevo componente `ErrorBoundary` envolviendo las vistas para aislar fallos sin pantallas en blanco y ofrecer recuperación en 1 clic.
  - Blindaje completo contra nulos y tipos en filtrado y ordenamiento de catálogos y auditorías.
- **🔍 Sistema de Zoom Interactivo:**
  - Soporte de atajos de teclado <kbd>Ctrl</kbd> + <kbd>+</kbd>, <kbd>Ctrl</kbd> + <kbd>-</kbd> y <kbd>Ctrl</kbd> + <kbd>0</kbd> tanto en Electron como en navegador web, con nivel de zoom persistido.

---

## [0.4.0] - 2026-08-26

### 🛍️ Catálogo de Variantes Independientes, Árbol Jerárquico de Categorías y Auditoría con Acciones en Lote
- **📋 Catálogo Centrado en Variantes Independientes (`src/components/tiendanube/TiendaNubeCatalog.jsx`):**
  - Cada fila representa una variante única con sus atributos específicos (Color, Medida, Espesor), SKU, costo ERP, factor de descuento aplicado y precio publicado.
  - Modal de factor discrecional (`%`) por variante con impacto y actualización instantánea en la API de Tiendanube.
  - Paginación dinámica y selector de cantidad por página (15, 25, 50, 100, Todos).
- **📁 Gestión Jerárquica de Categorías y Subcategorías (`src/components/tiendanube/TiendaNubeCategoriesView.jsx`):**
  - Vista en árbol con indentación y badges visuales para categorías padre e hijas.
  - Inputs para asignar porcentajes de descuento por categoría con herencia visual automática hacia las subcategorías.
  - Botón de refresco forzado directo desde la API oficial de Tiendanube con soporte multi-página.
- **🛡️ Auditoría Financiera con Selección Múltiple y Acciones en Lote (`src/components/tiendanube/TiendaNubeAuditView.jsx`):**
  - Checkboxes individuales y en cabecera para marcar variantes desactualizadas (`🔴 DIFERENCIA`).
  - Botón rápido *"Seleccionar todas las diferencias"*.
  - Barra flotante inferior de acciones en lote: **`⚡ Corregir X productos seleccionados`** con spinners de carga en vivo y transición instantánea a **`🟢 OK`**.
  - Selector de tolerancia configurable (±0.5% a ±10.0%).
- **⚡ Modal de Sincronización ERP (`src/components/tiendanube/TiendaNubeSyncModal.jsx`):**
  - Rediseño con énfasis en las reglas jerárquicas activas y slider de fallback fijado en `0%` por defecto.

---

## [0.3.0] - 2026-08-26

### 🛍️ Experiencia de Usuario Multicanal (Mercado Libre + Tiendanube)
- **🌐 Conmutador de Plataforma Activa (`src/components/common/PlatformSwitcher.jsx`):**
  - Selector visual en el encabezado principal que permite alternar fluidamente entre los espacios de trabajo de **Mercado Libre** ⚡ y **Tiendanube** 🛍️.
  - Adaptación contextual en vivo de títulos, subtítulos, badges de estado de conexión y acciones de reconexión.
- **📊 Panel de Control y KPIs de Tiendanube (`src/components/tiendanube/TiendaNubeDashboard.jsx`):**
  - Banner interactivo con ID de tienda (#8145042) y estado de conexión REST v1.
  - Tarjetas KPI: Total de productos sincronizados en SQLite, productos activos/publicados, productos sin stock (alerta) y valuación total del inventario.
  - Accesos directos a sincronización masiva ERP, creación de productos y explorador de catálogo.
- **📦 Explorador de Catálogo y Variantes (`src/components/tiendanube/TiendaNubeCatalog.jsx`):**
  - Tabla de artículos con thumbnails, marca, SKU, precio de lista, precio de oferta tachado, costo ERP y stock.
  - Búsqueda en tiempo real por nombre, SKU, marca o ID numérico.
  - Filtros combinados por estado (`Publicados` / `Ocultos`) y por categoría de tienda.
  - Acordeón interactivo para desplegar variantes hijas con sus atributos, SKU y stock específico.
  - Modal de ajuste rápido para editar precios y existencias en 1 clic.
- **🛠️ Modal Integral de Creación y Edición (`src/components/tiendanube/TiendaNubeProductModal.jsx`):**
  - Pestañas de Datos Generales (título `es`, descripción, marca, tags, categoría, envío gratis y visibilidad).
  - Constructor dinámico de atributos (hasta 3 atributos) y matriz de variantes hijas con validación de concordancia.
- **⚡ Módulo de Sincronización Masiva ERP (`src/components/tiendanube/TiendaNubeSyncModal.jsx`):**
  - Selector de archivo CSV y slider interactivo de margen comercial (+0% a +100%).
  - Barra de progreso en vivo conectada a `/tiendanube/sync/status` con contador de actualizados, no encontrados y errores.
  - Consola de logs de auditoría en tiempo real con coloreado semántico.
- **📡 Capa de Servicios API (`src/services/api.js`):**
  - Implementación completa de métodos para todos los endpoints de Tiendanube.

---

## 🗺️ Roadmap de Próximas Versiones (Frontend)

### [v0.4.0] - *Autenticación, Vistas por Rol y Seguridad (Offline RBAC)*
- **👥 Pantalla de Inicio de Sesión (Login View):**
  - Vista moderna de login con usuario y contraseña (validación offline).
  - Adaptación dinámica de la interfaz y permisos según el rol activo (Ocultar/bloquear acciones según sea *Administrador*, *Operador* o *Auditor*).
- **🔑 Interfaz de Recuperación de Contraseña Offline:**
  - Modal guiado para restablecer la contraseña mediante preguntas de seguridad predefinidas o ingreso de código de rescate master.

---

## [v0.2.0] - 2026-08-20

### 🚀 Novedades y Características Principales (Features)
- **📊 Panel de Control & Analíticas de MeLi en Tiempo Real:**
  - Integración de tarjetas KPI para Estado Backend, Nivel de Reputación, Valuación Total de Inventario y Cobertura de Envíos Me2.
  - Indicadores clave de rendimiento: Ventas Completadas, Tasa de Reclamos (%) y Envíos con Demora (%).
  - Módulo de Alertas Operativas en vivo (detección de publicaciones sin SKU, reclamos altos y publicaciones pausadas).
- **🧮 Calculadora & Simulador Financiero Estratégico:**
  - Simulador con parámetros personalizables: Precio mostrador, margen neto deseado, tipo de publicación, categoría, alícuota de impuestos/IIBB y fletes bonificados.
  - Desglose instantáneo con rentabilidad monetaria, margen neto obtenido y radiografía financiera de comisiones y deducciones.
- **⚙️ Módulo de Configuración Integral (Reemplazo de 'Reglas y Excepciones'):**
  - Interfaz unificada con pestañas para: *Parámetros Generales* (descuentos ERP, bonificación Me2, impuestos, tolerancia), *Exclusiones* (palabras clave y categorías) y *Multiplicadores de Pack*.

---

## [v0.1.0] - 2026-08-19

### 🚀 Novedades y Características Principales (Features)
- **Diseño Visual Moderno & Responsive:** Tema en escala de grises cálidos con acento corporativo rojo (#dc2626) en Tailwind CSS v4.
- **Módulo de Publicaciones:**
  - Tabla multicolumna interactiva con búsqueda en vivo, filtros por estado (ctive / paused) y por presencia de SKU.
  - Acordeón desplegable para consultar variaciones jerárquicas hijas (Color, Medida, Talle).
  - Modal de edición multi-campo (SKU ERP, título, precio mostrador, precio directo y estado).
  - Badge visual de última sincronización con Mercado Libre con persistencia en localStorage.
- **Módulo de Auditoría de Rentabilidad:**
  - Recalculación instantánea en vivo (0 ms) de la tolerancia (2%, 5%, 10%) sin necesidad de re-auditar en el backend.
  - Tarjetas KPIs en vivo para contabilizar publicaciones en rango rentable (OK), bajo margen (BAJO) y alto margen (ALTO).
  - Modal de desglose de deducciones financieras (comisión oficial, envío gratis bonificado por reputación, retenciones impositivas y diferencia en mano vs ERP).
  - Badge visual de fecha y hora de la última auditoría con persistencia en localStorage.
- **Sincronizador Masivo:**
  - Subida de archivos CSV con drag-and-drop.
  - Barra de progreso en tiempo real con conteo de éxitos/fallos y visor de eventos en segundo plano.
  - Modal de confirmación para evitar sincronizaciones accidentales.
- **Simulador / Calculadora:** Formulario para proyectar precios óptimos de publicación por categoría y tipo de listado.
- **Reglas de Excepción:** Editor visual de palabras clave y categorías excluidas.
- **Mini Console CLI:** Terminal flotante minimizable en la barra lateral para inspección de logs del backend.

### 🛠️ Mejoras de Experiencia de Usuario (UX Improvements)
- **Filas 100% Clickeables:** Apertura directa de modales de edición (en Publicaciones) y desglose de costos (en Auditoría) al hacer clic en cualquier parte de la fila.
- **Cierre Rápido de Modales (Backdrop Dismiss):** Cierre automático al tocar el fondo oscuro fuera de la tarjeta modal, con aislamiento de eventos internos (stopPropagation).
- **Feedback Flotante (Toast Notifications):** Notificaciones flotantes animadas para todas las acciones y reportes de error.

### 🐛 Correcciones (Fixes)
- **Estandarización de Modelos:** Compatibilidad con la propiedad unificada id de las publicaciones.
- **Manejo de Variaciones:** Aislamiento de clics en el botón del acordeón de variaciones y enlace externo a Mercado Libre.
