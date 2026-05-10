# Fases De Desarrollo - Pixel Crunch

Documento actualizado en mayo 2026 con estado real del repositorio.

## Fase 0: Setup Inicial (Completada)

- [x] Astro + React + TailwindCSS configurados.
- [x] Base de proyecto, docs iniciales y PWA plugin instalado.

## Fase 1: UI Base (Completada)

- [x] Componentes UI base (`Button`, `Card`, `Badge`, `Toaster`).
- [x] Carga de archivos con drag and drop.
- [x] Previews y acciones basicas de UI.
- [x] Tema claro/oscuro e i18n ES/EN.

## Fase 2: Compresión Core + UX Home (Completada)

- [x] Hook `useImageCompression.ts`.
- [x] Worker `compression.worker.ts`.
- [x] Componentes `CompressionProgress`, `CompressionStats`, `QualitySlider`, `ImageComparison`.
- [x] Soporte de compresión de entrada: JPG/JPEG/JFIF, PNG, WebP, GIF y SVG.
- [x] Home con flujo dual (Compresor + Convertidor) sincronizado entre Hero, panel de carga y bloque informativo.
- [x] Scaffold UX del modo Converter en Home (zona de carga, acciones, selección de formato y CTA).
- [x] Descarga individual y masiva en ZIP.
- [x] Pruebas base con Vitest + cobertura.
- [x] **Pipeline de Calidad:** GitHub Actions (`quality.yml`) configurado para ejecutar `typecheck`, `test` y `build` en cada PR.
- [x] Integración de SVG sin romper el pipeline raster.
- [x] Motor real de conversión inicial para el modo Converter (HEIC/JPG/PNG/WebP/GIF/BMP/TIFF/AVIF/ICO -> JPG/PNG/WebP/AVIF).
- [x] Soporte de conversión GIF con estrategia para GIF animado (exportación de primer fotograma).

## Fase 3: PWA, SEO y Producción (Completada)

- [x] Integración base PWA (`@vite-pwa/astro`).
- [x] **CD (Continuous Deployment):** Despliegue automático a **Cloudflare Pages** en cada push a `main`.
- [x] **Entornos de Preview:** Generación de previews automáticos en Cloudflare para cada Pull Request.
- [x] Validación offline básica y manifiesto PWA.
- [x] SEO técnico completo: meta tags (OG, Twitter), structured data JSON-LD, sitemap XML, robots.txt.
- [x] Localización completa de la interfaz (i18n ES/EN): tabs, Header, Footer, nombres de archivos comprimidos.
- [x] Página 404 personalizada bilingüe con diseño Monokai.
- [x] Inyección explícita de `<link rel="manifest">` y registro de Service Worker.

## Fase 4: Post-MVP / Expansiones (Backlog)

- [ ] Presets de compresión avanzados.
- [ ] Flujo batch global mejorado.
- [ ] Mejoras de accesibilidad AA ampliada.
- [ ] Optimizaciones de bundle y performance.
- [ ] Expansiones de conversión (según roadmap de formatos).

## Fase 5: Mantenimiento Técnico (Backlog)

- [ ] Migración a Astro 6.
- [ ] Actualización de integraciones y toolchain compatible (`@astrojs/react`, Vite y TypeScript).
- [ ] Ajustes de configuración y validación completa post-migración.
