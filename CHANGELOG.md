# 📝 Changelog - Frontend GUI (Desktop Electron)

Todos los cambios notables en la interfaz gráfica, componentes visuales y experiencia de usuario serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## 🗺️ Roadmap de Próximas Versiones (Frontend)

### [v0.3.0] - *Autenticación, Vistas por Rol y Seguridad*
- **👥 Pantalla de Inicio de Sesión (Login View):**
  - Vista moderna de login con usuario y contraseña (validación offline).
  - Adaptación dinámica de la interfaz y permisos según el rol activo (Ocultar/bloquear acciones según sea *Administrador*, *Operador* o *Auditor*).
- **🔑 Interfaz de Recuperación de Contraseña Offline:**
  - Modal guiado para restablecer la contraseña mediante preguntas de seguridad predefinidas o ingreso de código de rescate master.

---

### [v0.4.0] - *Experiencia Multicanal (Mercado Libre + Tiendanube)*
- **🌐 Conmutador de Plataforma Activa:**
  - Selector visual en el login o en el header para alternar entre el espacio de trabajo de **Mercado Libre** o **Tiendanube**.
- **🛍️ Vistas y Componentes para Tiendanube:**
  - Tablas dedicadas para gestionar el catálogo de Tiendanube (precios, control de stock, variantes y promociones activas).
  - Módulo de sincronización masiva adaptado a las columnas y particularidades de Tiendanube.

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
