# App GUI Desktop - Actualizador Mercado Libre

Interfaz gráfica de escritorio moderna desarrollada con **Electron**, **React 19**, **Vite** y **Tailwind CSS v4** para la gestión y sincronización de precios con la API de Mercado Libre.

---

## 📚 Documentación y Registro de Versiones
- **[📝 Registro de Cambios (Changelog)](CHANGELOG.md):** Historial de versiones y nuevas características de la GUI.
- **[📖 Manual de Usuario General](../MANUAL_DE_USUARIO.md):** Guía operativa paso a paso de toda la plataforma.

---

## 🎨 Características de la Interfaz Visual

- **Diseño Moderno:** Tema off-white profesional con acento en rojo corporativo (`#dc2626`).
- **Estados de Carga y Feedback:** Animaciones de carga, spinners, toasters interactivos y modales de confirmación para acciones críticas.
- **Filtrado y Ordenamiento Multicolumna:** 
  - Búsqueda en tiempo real por SKU, Título o ID MeLi.
  - Ordenamiento ascendente/descendente en todas las columnas.
  - Filtro por estado (`Activas / Pausadas`), dictamen de auditoría y disponibilidad de SKU (`Con SKU / Sin SKU N/A`).
- **Acordeón Desplegable para Variaciones:** Visualización de productos padres con variantes asociadas (Color, Medida, Talle).
- **Modal de Edición Multi-campo:** Edición instantánea de SKU, Título, Estado y Precios.
- **Mini Console CLI:** Visualizador integrado de logs de consola del backend en la barra lateral.

---

## 🛠️ Comandos Disponibles

### Modo Desarrollo (Desktop Electron)
```bash
npm run electron:dev
```

### Compilar Proyecto
```bash
npm run build
```
