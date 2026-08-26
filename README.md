# App Desktop GUI - Sincronizador Multicanal (Mercado Libre & Tiendanube)

Interfaz gráfica de escritorio moderna desarrollada con **Electron**, **React 19**, **Vite** y **Tailwind CSS v4** para la gestión centralizada, auditoría y sincronización masiva de precios y stock con **Mercado Libre** y **Tiendanube (Nuvemshop)**.

---

## 📚 Documentación y Enlaces
- **[📝 Registro de Cambios (Changelog)](CHANGELOG.md):** Historial de versiones (`v0.3.0`) y nuevas características de la GUI.
- **[🗺️ Roadmap del Frontend](ROADMAP.md):** Seguimiento de fases implementadas y próximas versiones.
- **[📖 Manual de Usuario General](../actualizador_mercadolibre/MANUAL_DE_USUARIO.md):** Guía operativa paso a paso de toda la plataforma.
- **[⚙️ Documentación del Backend API](../actualizador_mercadolibre/README.md):** Especificación técnica de endpoints REST y base de datos SQLite.

---

## 🎨 Características de la Interfaz Visual

### 🌐 1. Hub de Inicio / Selector de Plataforma
* Pantalla inicial de bienvenida ([`PlatformSelectorScreen.jsx`](src/components/common/PlatformSelectorScreen.jsx)) que permite elegir el canal de trabajo al abrir la aplicación:
  * **Mercado Libre ⚡:** Publicaciones MeLi, simulador financiero, cálculo de comisiones Me2, auditoría de rentabilidad y sincronización ERP.
  * **Tiendanube 🛍️:** Catálogo online, matriz dinámica de variantes (hasta 3 atributos), precios de lista/oferta, control de stock y sincronizador ERP.
* Acceso rápido en barra lateral y encabezado mediante el botón **`← Cambiar de Canal / Inicio`**.

### 🛍️ 2. Módulo de Tiendanube (Nuvemshop)
* **Dashboard Tiendanube ([`TiendaNubeDashboard.jsx`](src/components/tiendanube/TiendaNubeDashboard.jsx)):** Estado de conexión en vivo con ID de tienda, KPIs de inventario (Total, Activos, Sin Stock, Valuación $) y accesos directos.
* **Catálogo & Variantes ([`TiendaNubeCatalog.jsx`](src/components/tiendanube/TiendaNubeCatalog.jsx)):**
  * Tabla con thumbnails, búsqueda en tiempo real por SKU (padre y variante), marca o título.
  * **Paginación Interactiva:** Selector de items por página (15, 25, 50, 100 o Todos) y barra de navegación de páginas con autoreset.
  * Acordeón desplegable para consultar y editar variantes hijas con sus precios y existencias.
  * Modal de ajuste rápido para modificar precios y stock en 1 clic.
* **Modal Integral de Producto ([`TiendaNubeProductModal.jsx`](src/components/tiendanube/TiendaNubeProductModal.jsx)):** Formulario de alta y edición con constructor dinámico de hasta 3 atributos y matriz de combinaciones.
* **Sincronización Masiva ERP ([`TiendaNubeSyncModal.jsx`](src/components/tiendanube/TiendaNubeSyncModal.jsx)):** Subida de CSV de mostrador, slider de margen comercial (+0% a +100%), barra de progreso en vivo y consola de logs.

### ⚡ 3. Módulo de Mercado Libre
* **Panel de Analíticas:** Reputación oficial, tasa de reclamos, demoras y cobertura de Mercado Envíos Me2.
* **Inventario de Publicaciones:** Búsqueda por SKU/ID, ordenamiento multicolumna y edición rápida de títulos, precios y estado.
* **Auditoría Financiera:** Comparativa de neto recibido vs mostrador ERP con margen de tolerancia configurable.
* **Calculadora & Simulador Estratégico:** Parametrización de comisiones, fletes, retenciones impositivas y margen neto.

---

## 🛠️ Comandos Disponibles

### Iniciar Aplicación Desktop (Electron + React)
```powershell
npm start
# (O npm run electron:dev)
```

### Iniciar Servidor Web de Desarrollo (Solo Navegador)
```powershell
npm run dev
```

### Compilar Proyecto para Producción
```powershell
npm run build
```
