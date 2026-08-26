# App Desktop GUI - Sincronizador Multicanal (Mercado Libre & Tiendanube)

Interfaz gráfica de escritorio moderna desarrollada con **Electron**, **React 19**, **Vite** y **Tailwind CSS v4** para la gestión centralizada, auditoría y sincronización masiva de precios y stock con **Mercado Libre** y **Tiendanube (Nuvemshop)**.

---

## 📚 Documentación y Enlaces
- **[📝 Registro de Cambios (Changelog)](CHANGELOG.md):** Historial de versiones (`v0.4.0`) y nuevas características de la GUI.
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
* **Catálogo de Variantes ([`TiendaNubeCatalog.jsx`](src/components/tiendanube/TiendaNubeCatalog.jsx)):**
  * Cada fila representa una variante independiente con atributos (ej: 18mm, Blanco), SKU, costo ERP, factor de descuento y precio publicado.
  * Paginación interactiva (15, 25, 50, 100 o Todos) con barra de navegación dinámica.
  * Modal de factor discrecional (`%`) con cálculo en vivo e impacto inmediato en la API de Tiendanube.
* **Reglas de Descuento por Categoría ([`TiendaNubeCategoriesView.jsx`](src/components/tiendanube/TiendaNubeCategoriesView.jsx)):**
  * Árbol de categorías y subcategorías (ej: *Melaminas y MDF > Tableros/Placas*) con inputs de `% Descuento` y herencia visual.
  * Botón de sincronización forzada multi-página directa desde la API de Tiendanube.
* **Auditoría Financiera y Corrección en Lote ([`TiendaNubeAuditView.jsx`](src/components/tiendanube/TiendaNubeAuditView.jsx)):**
  * Comparativa variante por variante contra costo ERP con dictamen `OK`, `DIFERENCIA` o `SIN_ERP`.
  * Selección múltiple con barra flotante para **`⚡ Corregir X productos seleccionados`** en 1 clic.
* **Sincronización Masiva ERP ([`TiendaNubeSyncModal.jsx`](src/components/tiendanube/TiendaNubeSyncModal.jsx)):** Cruce inteligente en memoria de 9.100 filas de CSV contra variantes reales de Tiendanube y log en vivo.

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
