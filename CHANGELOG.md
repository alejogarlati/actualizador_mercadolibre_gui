# 📝 Changelog - GUI Desktop

Todos los cambios notables en la interfaz gráfica serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## 🗺️ Roadmap de Próximas Versiones

### [v0.2.0] - *Próxima Entrega*
- **📊 Panel de Métricas (Dashboard) Avanzado:**
  - Integración visual con analíticas de la API de Mercado Libre (gráficos de rendimiento, ventas del período, conversión y alertas).
- **🧮 Refactor Integral de Calculadora:**
  - Controles interactivos y personalizados para simulación de impuestos, bonificaciones por reputación y costos de envío configurables en tiempo real.
- **⚙️ Rediseño de Módulo a 'Configuración':**
  - Transformación del tab *'Reglas y Excepciones'* en un panel integral de *'Configuración'* con pestañas para reglas de precios, exclusiones, discrecionales y ajustes de cuenta.

---

### [v0.3.0] - *Autenticación y Control de Acceso*
- **👥 Pantalla de Login y Gestión de Roles:**
  - Login interactivo con usuario y contraseña (offline).
  - Vistas y permisos adaptados según el rol del usuario (Administrador, Operador, Auditor).
- **🔑 Recuperación de Contraseña Offline:**
  - Flujo de recuperación seguro mediante preguntas secretas o clave maestra local sin depender de servidores de correo.

---

### [v0.4.0] - *Soporte Multicanal (Mercado Libre + Tiendanube)*
- **🌐 Selector de Plataforma en Login:**
  - Conmutador para elegir el canal de trabajo activo: **Mercado Libre** o **Tiendanube**.
- **🛍️ Gestión para Tiendanube:**
  - Interfaces para sincronización de catálogo, actualización de stock en tiempo real y administración de precios y promociones.

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
