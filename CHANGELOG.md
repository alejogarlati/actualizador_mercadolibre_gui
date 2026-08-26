# 📝 Changelog - Frontend GUI (Desktop Electron)

Todos los cambios notables en la interfaz gráfica, componentes visuales y experiencia de usuario serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased] - Propuesto / Planificado

### 🛍️ Interfaz de Usuario y Componentes para Tiendanube - *En Planificación*
- **Conmutador de Plataforma Activa (MeLi ⚡ / Tiendanube 🛍️):**
  - Selector visual en el header/barra de navegación para alternar de forma transparente entre el catálogo y operaciones de Mercado Libre y Tiendanube.
  - Adaptación contextual de KPIs, métricas de inventario y acciones rápidas según la plataforma activa.
- **Modal Integral de Alta y Edición de Productos Tiendanube:**
  - Formulario estructurado para datos generales (nombre multilingüe, descripción HTML enriquecida, categorías, marca, visibilidad y envío gratis).
  - Configuración de precios (precio regular, precio promocional de oferta tachado, costo mostrador ERP) e inventario (stock global/por depósito, SKU principal, código de barras, peso en kg y dimensiones físicas).
  - Constructor dinámico de variantes: configuración de hasta 3 atributos por producto y matriz de variantes hijas con validación de consistencia entre atributos y combinaciones de valores (`values`).
- **Listado de Catálogo y Monitoreo de Sincronización:**
  - Tabla de productos Tiendanube con búsqueda por SKU/título, filtros por estado (`published`), badges de stock y acordeón interactivo para variaciones.
  - Componente de sincronización masiva adaptado a Tiendanube: carga de CSV de mostrador ERP con drag-and-drop, barra de progreso en vivo conectada a `/tiendanube/sync/status` y resumen de auditoría.
- **Feedback Visual de Rate Limiting y Resiliencia:**
  - Banners y notificaciones flotantes (toasts) que informan al usuario cuando las peticiones se encuentran pausadas por control de tráfico (*Leaky Bucket* de Tiendanube con header `Retry-After`).
  - Validación preventiva en cliente para evitar envíos con discordancia de atributos o precios con formato inválido.
- **Requisitos de Calidad y Testing (Obligatorios para la futura implementación):**
  - *Tests unitarios de frontend:* Cobertura de servicios en `src/services/api.js`, formateadores y renderizado de componentes clave (modal de producto, matriz de variantes y conmutador de canal).
  - *Tests de impacto / no regresión:* Comprobación de que la interfaz de Mercado Libre no sufre roturas ni efectos colaterales al alternar de plataforma.

---

## 🗺️ Roadmap de Próximas Versiones (Frontend)

### [v0.3.0] - *Experiencia Multicanal (Mercado Libre + Tiendanube) - [EN DESARROLLO / PRÓXIMO HITO]*
> **Nota de Repriorización:** Se adelantó el hito de interfaz multicanal a la versión `v0.3.0` para acompañar el soporte backend de Tiendanube y permitir la gestión y sincronización de catálogo de ambos canales desde la app de escritorio, postergando el login RBAC a la `v0.4.0`.

- **🌐 Conmutador de Plataforma Activa:**
  - Selector visual en el header de navegación para alternar fluidamente entre los catálogos y métricas de **Mercado Libre** o **Tiendanube**.
- **🛍️ Vistas y Componentes para Tiendanube:**
  - Tabla y vista de catálogo para Tiendanube (precios, control de stock, variantes y promociones activas).
  - Modal integral de alta/edición de producto con constructor dinámico de variantes (hasta 3 atributos).
  - Módulo de sincronización masiva adaptado a Tiendanube con feedback de rate limit (*Leaky Bucket*).

---

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
