# Especificaciones Técnicas (Actualizado)

## Stack Core
- **Framework:** Astro 5.0
- **UI:** React 19 (Islands Architecture).
- **Estilos:** TailwindCSS v4 + `clsx` & `tailwind-merge` para clases dinámicas.
- **PWA:** `@vite-pwa/astro` (Soporte Offline y Manifest).

## Herramientas de Desarrollo
- **GitHub MCP:** Para gestión automatizada de Issues, ramas y Pull Requests
- **Chrome DevTools MCP:** Para validación de errores en tiempo real durante desarrollo
- Ver [AGENTS.md](/AGENTS.md) para el flujo de trabajo completo

## Librerías Clave
1.  **Compresión:** `browser-image-compression` (Abstracción sólida sobre Canvas/Web Workers).
    * *Nota:* Para la V1 usaremos esta por estabilidad. En V2 podemos migrar a `@jsquash/avif` (WASM puro) si necesitamos más potencia, pero `browser-image-compression` ya es excelente.
2.  **Archivos:** `react-dropzone` (Drag & Drop).
3.  **Descargas:** `jszip` (Empaquetado) + `file-saver`.
4.  **Estado Persistente:** `localStorage` (Custom Hook `useLocalStorage` para el historial).
5.  **Iconos:** `lucide-react`.

## Requerimientos Funcionales V1
- **Offline First:** Debe funcionar sin internet tras la primera carga (Service Workers).
- **Privacidad:** NINGUNA imagen sale del dispositivo del usuario.
- **Historial:** Guardar metadatos de las últimas 5 compresiones (Nombre, fecha, % ahorrado) en localStorage.
- **UX:** Feedback visual de progreso (Loading Bars) y notificaciones (Toasts) de éxito.