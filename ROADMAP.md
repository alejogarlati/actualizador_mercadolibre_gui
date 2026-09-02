# 🗺️ Roadmap del Sistema: Sincronizador Multicanal (Frontend & Backend)

Este documento establece la hoja de ruta y planificación de hitos evolutivos para el ecosistema **Sincronizador & Actualizador Masivo** ([`actualizador_mercadolibre_gui`](./README.md) y [`actualizador_mercadolibre`](../actualizador_mercadolibre/README.md)).

---

## 🎯 Hito Principal [v0.3.0]: Integración Tiendanube (Nuvemshop)

> **Decisión de Release / Repriorización:** Este hito se estableció como la versión `v0.3.0` del sistema para habilitar la sincronización multicanal comercial de forma inmediata, posponiendo el módulo de roles/autenticación local a la versión `v0.4.0`.

### 📌 Objetivo
Integrar **Tiendanube** como segunda plataforma de venta oficial dentro del ecosistema, replicando el patrón de sincronización y control de mostrador ERP que ya opera para **Mercado Libre**, pero adaptado estrictamente a las especificaciones técnicas y modelo de dominio de Tiendanube (OAuth 2.0, rate limiting tipo *Leaky Bucket*, jerarquía producto-variante con hasta 3 atributos, campos multilingües, endpoints de stock y precios de lista/promoción).

---

### 🏗️ Desglose de Fases de Implementación

```
                                  SISTEMA MULTICANAL
                                          │
              ┌───────────────────────────┴───────────────────────────┐
              ▼                                                       ▼
      [ MERCADO LIBRE ]                                       [ TIENDANUBE ]
  ├── core/client.py                                      ├── core/tiendanube_client.py
  ├── core/calculator.py (Comisiones MeLi, Envíos)        ├── core/tiendanube_models.py
  ├── services/sync_service.py                            ├── services/tiendanube_sync_service.py
  ├── api/server.py (/items, /sync)                       ├── api/routers/tiendanube_router.py
  └── SQLite: tabla 'items'                               └── SQLite: tabla 'tiendanube_items'
```

---

### ⚙️ FASES DE BACKEND

#### 🔹 Fase B1: Dominio, Modelos y Configuración
- [ ] **Configuración (.env y Settings):** Incorporación de variables `TN_STORE_ID`, `TN_ACCESS_TOKEN`, `TN_USER_AGENT`, `TN_APP_ID`, `TN_APP_SECRET` en [`config/settings.py`](../actualizador_mercadolibre/config/settings.py).
- [ ] **Modelos de Dominio (`core/tiendanube_models.py`):** Dataclasses para `TNProduct`, `TNVariant`, `TNCategory`, `TNImage`, `TNCustomField` soportando campos multilingües (`dict[str, str]`).
- [ ] **Esquemas de Validación Pydantic (`core/schemas.py`):** Schemas para request/response de alta, edición puntual, consulta de stock y cálculo de precios para Tiendanube.

#### 🔹 Fase B2: Cliente HTTP Oficial (`core/tiendanube_client.py`)
- [ ] **Autenticación y Headers Obligatorios:** Implementación de cabeceras fijas `Authentication: Bearer <token>`, `User-Agent: <App> (<email>)` y `Content-Type: application/json`.
- [ ] **Control de Tráfico y Rate Limiting (*Leaky Bucket*):**
  - Manejo adaptativo del bucket (capacidad 40 reqs, leaky rate 2 req/s).
  - Inspección de cabeceras `x-rate-limit-limit`, `x-rate-limit-remaining`, `x-rate-limit-reset`.
  - Mecanismo de reintentos exponenciales ante respuestas HTTP 429 (`Retry-After`).
  - Soporte para *Weighted Token Bucket* en llamadas por lote.
- [ ] **Operaciones CRUD Completas:**
  - `get_products(page, per_page, updated_at_min, fields)`
  - `get_product_by_id(product_id)`
  - `get_product_by_sku(sku)` vía `GET /products/sku/{sku}` para búsqueda directa y rápida de mostrador.
  - `create_product(payload)` (alta integral de padre + variantes + atributos).
  - `update_product(product_id, payload)` (título, descripción HTML, visibilidad, tags, marca).
  - `update_variant(product_id, variant_id, payload)` (precio, precio promocional, costo, SKU, medidas).
  - `update_variants_batch(product_id, variants_payload)` vía `PUT /products/{id}/variants`.
  - `update_stock(product_id, stock_payload)` vía `POST /products/{id}/variants/stock` (`replace` / `variation`).
  - `upload_image(product_id, src_url_or_base64)` y `get_categories()`.

#### 🔹 Fase B3: Persistencia Local en SQLite (`core/db.py`)
- [ ] **Tabla Dedicada `tiendanube_items`:**
  - Estructura: `id` (PK), `sku`, `name`, `price`, `promotional_price`, `cost`, `stock`, `status` (`active`/`hidden`), `category_id`, `category_name`, `handle`, `permalink`, `thumbnail`, `dimensions`, `weight`, `variants_json`, `raw_attributes_json`, `last_updated`, `updated_at`.
- [ ] **Tabla Dedicada `tiendanube_sync_history`:**
  - Registro de auditoría de modificaciones de precios y stock en Tiendanube con timestamps y detalle.
- [ ] **Funciones de Acceso y Actualización:** `save_tn_items_to_db()`, `get_tn_items_from_db()`, `update_single_tn_item_in_db()`.
- [ ] **Aislamiento Total:** Garantizar que las operaciones sobre `tiendanube_items` no modifiquen ni bloqueen la tabla `items` de Mercado Libre.

#### 🔹 Fase B4: Servicio de Sincronización Masiva (`services/tiendanube_sync_service.py`)
- [ ] **Cruce Inteligente de Catálogo vs Mostrador:** Lógica de matcheo SKU a SKU contra `erp_precios.csv` / Excel.
- [ ] **Reglas de Fijación de Precios:** Aplicación de márgenes comerciales sobre costo de mostrador, cálculo de precio regular vs precio promocional tachado (descuentos especiales).
- [ ] **Actualización Eficiente de Stock e Inventario:** Sincronización de existencias de depósito hacia Tiendanube.
- [ ] **Monitoreo en Tiempo Real:** Estado de sincronización en memoria (`TN_SYNC_PROGRESS`) reportando cantidad procesada, actualizados, no encontrados, errores y porcentaje.

#### 🔹 Fase B5: Endpoints REST en FastAPI (`api/routers/tiendanube_router.py`)
- [ ] **Rutas de Estado y Catálogo:**
  - `GET /tiendanube/health`: Verificación de credenciales y conectividad con la tienda.
  - `GET /tiendanube/items`: Consulta de catálogo desde SQLite local con filtros y paginación.
  - `POST /tiendanube/items/refresh`: Sincronización completa desde la API hacia SQLite local.
- [ ] **Rutas de Gestión y Modificación:**
  - `POST /tiendanube/items/create`: Alta de nuevo producto con sus variantes.
  - `POST /tiendanube/items/{product_id}/update`: Edición de propiedades, precios y stock.
- [ ] **Rutas de Sincronización Masiva:**
  - `POST /tiendanube/sync/execute`: Disparo en background de la sincronización ERP -> Tiendanube.
  - `GET /tiendanube/sync/status`: Consulta del progreso del sync.
- [ ] **Montaje Modular:** Inclusión del router en [`api/server.py`](../actualizador_mercadolibre/api/server.py) mediante `app.include_router(tiendanube_router, prefix="/tiendanube")`.

---

### 🎨 FASE DE FRONTEND (Implementada en `actualizador_mercadolibre_gui`)

#### 🔹 Fase F1: Conmutador de Plataforma y Contexto Visual
- [x] **Selector de Plataforma en Header/Navbar:** Selector o pestañas de acceso rápido (**Mercado Libre** ⚡ | **Tiendanube** 🛍️) que actualizan el contexto activo de la aplicación ([`src/components/common/PlatformSwitcher.jsx`](./src/components/common/PlatformSwitcher.jsx)).
- [x] **Adaptación Dinámica de KPIs y Vistas:** Visualización de métricas específicas del canal seleccionado (productos activos, productos sin stock, total variantes, valuación) ([`src/components/tiendanube/TiendaNubeDashboard.jsx`](./src/components/tiendanube/TiendaNubeDashboard.jsx)).

#### 🔹 Fase F2: Modal Integral de Alta y Edición de Productos Tiendanube
- [x] **Datos Principales:** Título/Nombre (`es`), descripción con formato HTML/enriquecido, marca y selección de categorías.
- [x] **Precios y Finanzas:** Precio regular (`price`), precio promocional en oferta (`promotional_price`), costo de mostrador ERP (`cost`).
- [x] **Logística e Identificadores:** SKU principal, código de barras (EAN/GTIN/ISBN), peso en kg y dimensiones físicas (alto x ancho x profundidad en cm).
- [x] **Constructor Dinámico de Variantes (hasta 3 atributos):**
  - Definición de atributos a nivel de producto (ej. `Color`, `Medida`, `Espesor`).
  - Matriz interactiva de variantes hijas donde se configuran los valores exactos (`values`), SKU por variante, stock específico y precio diferencial ([`src/components/tiendanube/TiendaNubeProductModal.jsx`](./src/components/tiendanube/TiendaNubeProductModal.jsx)).
  - Validación automática en cliente para asegurar concordancia entre la cantidad de atributos del padre y los valores de cada variante antes de enviar.

#### 🔹 Fase F3: Listado de Catálogo y Progreso de Sincronización Masiva
- [x] **Tabla de Productos Tiendanube:**
  - Búsqueda en tiempo real por SKU, nombre y categoría ([`src/components/tiendanube/TiendaNubeCatalog.jsx`](./src/components/tiendanube/TiendaNubeCatalog.jsx)).
  - Badges de estado (`Publicado`, `Oculto`, `Sin Stock`).
  - Acordeón desplegable para consultar y editar variantes hijas.
- [x] **Panel de Sincronización Masiva Tiendanube:**
  - Reutilización y extensión del componente de subida de CSV mostrador con drag-and-drop ([`src/components/tiendanube/TiendaNubeSyncModal.jsx`](./src/components/tiendanube/TiendaNubeSyncModal.jsx)).
  - Barra de progreso interactiva consumiendo `/tiendanube/sync/status`.
  - Registro de auditoría visual con reporte de SKUs actualizados, en falta o con advertencias.

#### 🔹 Fase F4: Resiliencia, Feedback de Rate Limiting y Manejo de Errores
- [x] **Indicador de Rate Limiting / Throttling:** Toast notifications y banners informativos cuando la API de Tiendanube entra en espera por consumo del bucket de 40 requests (*Leaky Bucket*).
- [x] **Validación y Manejo de Errores Específicos:** Mensajes claros ante fallos de combinatoria de variantes, formato de precios decimales o claves duplicadas.

---

## 🎯 Hito [v0.5.0]: Rediseño Anthropic, Unificación Multicanal, Modo Oscuro y Resiliencia

### 📌 Objetivo
Transformar la aplicación en una suite de gestión de precios de nivel industrial adoptando las directrices de diseño de Anthropic (*Warm Light* & *Obsidian Charcoal*), unificando componentes transversales entre Mercado Libre y Tiendanube, añadiendo soporte multi-variante en lote, columnas redimensionables, aislamiento de errores y control de zoom.

### 🏗️ Desglose de Fases de Implementación

#### 🔹 Fase U1: Sistema de Diseño Anthropic y Dark Mode
- [x] **Paleta Oficial y Dark Theme:** Variables CSS en `src/index.css` con selector `.dark` y persistencia en `localStorage`.
- [x] **Conmutador de Tema (☀️ / 🌙):** Integrado en Header, pie de Sidebar y Hub Central.
- [x] **Escala Tipográfica:** Tipografía base a 13px con interlineado 1.45 y fuentes Sans/Mono de Anthropic.

#### 🔹 Fase U2: Navegación y Vistas Unificadas
- [x] **Sidebar Colapsable:** Animación fluida, estado persistido y alineación de iconos.
- [x] **Vistas Homogéneas de Sincronización:** `TiendaNubeSyncView.jsx` con layout idéntico a `MeliSyncView.jsx` (2 columnas).
- [x] **Auditoría Financiera Multicanal:** Selección masiva y corrección con 1 clic.

#### 🔹 Fase U3: Interactividad y Acciones Masivas
- [x] **Columnas Redimensionables:** Soporte de arrastre horizontal en `Table.jsx`.
- [x] **Isla Flotante de Acciones en Lote:** Modificación masiva de factores y precios.
- [x] **Zoom Desktop:** Atajos <kbd>Ctrl</kbd> + <kbd>+</kbd>, <kbd>Ctrl</kbd> + <kbd>-</kbd>, <kbd>Ctrl</kbd> + <kbd>0</kbd> en Electron y Web.

#### 🔹 Fase U4: Resiliencia y Estabilidad
- [x] **Componente ErrorBoundary:** Aislamiento de excepciones visuales para prevenir pantallas en blanco.
- [x] **Null Safety:** Blindaje de búsquedas, ordenamientos y atributos null/undefined.

---

### 📈 Tabla de Seguimiento del Hito v0.5.0

| Componente | Capa | Estado | Verificación |
| :--- | :--- | :--- | :--- |
| **Theme Switcher & Obsidian Dark** | Frontend | ✅ Completado | Verificado en 100% de vistas y tablas |
| **Sidebar Colapsable** | Frontend | ✅ Completado | Persistencia probada |
| **TiendaNubeSyncView (2 Columnas)** | Frontend | ✅ Completado | Flujo idéntico a MeLi |
| **Tablas Redimensionables** | Frontend | ✅ Completado | Drag-to-resize activo |
| **Isla Flotante de Acciones en Lote** | Frontend | ✅ Completado | Modal multivariante probado |
| **Zoom con Atajos de Teclado** | Frontend/Electron | ✅ Completado | Zoom factor dinámico probado |
| **ErrorBoundary & Null Guards** | Frontend | ✅ Completado | Captura de errores reactivos |
| **Build & Compilación** | Frontend | ✅ Completado | Vite build exitoso (0 errores) |
