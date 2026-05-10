# Especificaciones Técnicas

## Stack Core
- **Framework:** Astro 5.18
- **UI interactiva:** React 19 (Islands Architecture)
- **Estilos:** TailwindCSS v4 + `clsx` + `tailwind-merge`
- **Compresión:** `browser-image-compression`
- **PWA:** `@vite-pwa/astro`
- **Testing:** Vitest + Testing Library + happy-dom

## Estado Técnico Actual
- Pipeline de compresión funcional en cliente con soporte de worker.
- Soporte de entrada validado para JPG/JPEG/JFIF, PNG, WebP, GIF y SVG.
- Home con dos modos de experiencia (Compresor y Convertidor) en la misma página.
- Pipeline de conversión cliente activo para HEIC, JPG/JPEG/JFIF, PNG, WebP, GIF, BMP, TIFF, AVIF e ICO con salida a JPG, PNG, WebP y AVIF.
- Estrategia GIF en conversión: si el GIF es estático se convierte de forma normal; si es animado se exporta el primer fotograma para mantener compatibilidad de salida.
- Internacionalización (i18n) completa: ES/EN para toda la interfaz (tabs, Header, Footer, nombres de archivos).
- SEO técnico: meta tags OG/Twitter, structured data JSON-LD (`WebApplication`), sitemap XML, robots.txt.
- Página 404 personalizada bilingüe.
- PWA con manifiesto explícito y registro de Service Worker.

## Formatos
### Compresión implementada
- JPG/JPEG/JFIF
- PNG
- WebP
- GIF
- SVG

### Conversión implementada
- Entradas: HEIC, JPG/JPEG/JFIF, PNG, WebP, GIF, BMP, TIFF, AVIF e ICO.
- Salidas: JPG, PNG, WebP y AVIF (dependiente de soporte del navegador).
- GIF animado: conversión por primer frame (estrategia documentada de compatibilidad).

## Herramientas de Desarrollo y Calidad
- **GitHub Actions:** workflow `quality.yml` con typecheck, test:coverage y build.
- **MCP GitHub:** gestión de issues y trazabilidad por fase.
- **MCP Browser/DevTools:** validación visual, consola y regresiones UX.
- Ver [AGENTS.md](/AGENTS.md) para el flujo operativo completo.

## Librerías Clave
1. **Compresión:** `browser-image-compression`
2. **Carga de archivos:** `react-dropzone`
3. **Descargas:** `file-saver` + `jszip`
4. **UI/UX:** `lucide-react` + `sonner`
5. **Pruebas:** `vitest`, `@testing-library/react`, `@testing-library/user-event`, `happy-dom`

## Requerimientos Funcionales
- **Privacidad:** 100% client-side; sin subida de imágenes a backend.
- **Rendimiento:** mantener UI responsiva durante compresión.
- **Calidad:** todo cambio relevante debe pasar `npm run verify`.
- **UX:** feedback visual (progreso, stats, toasts) y layout responsive.

## Seguridad y Mantenibilidad
- Validar tipo MIME y extensión en la capa de carga.
- Mantener mensajes de error claros por formato no soportado.