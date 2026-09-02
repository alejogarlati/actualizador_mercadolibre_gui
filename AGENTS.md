# Reglas de Desarrollo: Sistema de Sincronización Mercado Libre

1. **Lenguaje, Entorno y Frameworks:**
   - **Backend (Python 3.10+)**: Arquitectura modular orientada a objetos (Principios SOLID, Factory Method). Utiliza `FastAPI`, `uvicorn`, `pydantic` y `requests`.
   - **Frontend GUI (Node 20+)**: Aplicación Desktop multiplataforma basada en **Electron + React (Vite)** ubicada en `actualizador_mercadolibre_gui`.
   - **Manejo de Estilos**: CSS Vanilla moderno con variables personalizadas y soporte de tema oscuro sin librerías externas superfluas.

2. **Lógica de Negocio y API REST (`api/server.py`):**
   - El servidor de FastAPI expone endpoints REST en `http://localhost:8000`:
     - `GET /health`: Validación del token de Mercado Libre y estado del backend.
     - `POST /calculate`: Simulador financiero de comisiones, costos fijos y envío gratis.
     - `POST /sync/upload-csv` & `POST /sync/execute`: Carga de archivos `erp_precios.csv` y ejecución asíncrona en segundo plano.
     - `GET /stats`: Métricas en tiempo real de publicaciones.
   - **Regla Estricta (Bypass 400 Bad Request):** Para actualizar precios en Mercado Libre (`/items/$ITEM_ID`), el payload JSON no debe enviar únicamente `"price"`. Debe incluir atributos como `"status"` junto al precio para evitar restricciones de la API.

3. **Manejo de Errores, Encoding y Logs:**
   - Prevenir errores de codificación en consolas Windows (`cp1252`) reconfigurando `sys.stdout` y `sys.stderr` a `utf-8`.
   - Manejo de excepciones en cada iteración de la sincronización. Los errores se registran en `errores.log` sin detener el proceso masivo.

4. **Comandos de Ejecución:**
   - **Servidor Backend (FastAPI):** `python -m uvicorn api.server:app --reload`
   - **Aplicación Desktop (Electron + React):** `cd actualizador_mercadolibre_gui && npm run electron:dev`
   - **Servidor Web Dev:** `cd actualizador_mercadolibre_gui && npm run dev`

5. **Directrices de Diseño e Interfaz (DESIGN.md):**
   - Para el desarrollo, refactorización o estilizado de componentes visuales en el frontend, consultar y respetar estrictamente las pautas definidas en `DESIGN.md`.
