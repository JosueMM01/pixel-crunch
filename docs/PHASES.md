# Fases De Desarrollo - Pixel Crunch

Documento actualizado en abril 2026 con estado real del repositorio.

## Fase 0: Setup Inicial (Completada)

- [x] Astro + React + TailwindCSS configurados.
- [x] Base de proyecto, docs iniciales y PWA plugin instalado.

## Fase 1: UI Base (Completada)

- [x] Componentes UI base (`Button`, `Card`, `Badge`, `Toaster`).
- [x] Carga de archivos con drag and drop.
- [x] Previews y acciones basicas de UI.
- [x] Tema claro/oscuro e i18n ES/EN.

## Fase 2: Compresión Core + UX Home (En Progreso Avanzado)

- [x] Hook `useImageCompression.ts`.
- [x] Worker `compression.worker.ts`.
- [x] Componentes `CompressionProgress`, `CompressionStats`, `QualitySlider`, `ImageComparison`.
- [x] Soporte de compresión de entrada: JPG/JPEG/JFIF, PNG, WebP y SVG.
- [x] Home con flujo dual (Compressor + Converter) sincronizado entre Hero, panel de carga y bloque informativo.
- [x] Scaffold UX del modo Converter en Home (zona de carga, acciones, selección de formato y CTA).
- [x] Descarga individual y masiva en ZIP.
- [x] Pruebas base con Vitest + cobertura.
- [x] **Pipeline de Calidad:** GitHub Actions (`quality.yml`) configurado para ejecutar `typecheck`, `test` y `build` en cada PR.
- [x] Integración de SVG sin romper el pipeline raster.
- [ ] Motor real de conversión para el modo Converter.
- [ ] Soporte de conversión GIF (registrado en backlog de conversión).

## Fase 3: Persistencia E Historial

- [ ] Historial local de compresiones (metadata, FIFO, limpieza).
- [ ] Hook dedicado de persistencia (`useLocalStorage` para historial).

## Fase 4: PWA Y Producción (Completada Operacionalmente)

### Completado
- [x] Integración base PWA (`@vite-pwa/astro`).
- [x] **CD (Continuous Deployment):** Despliegue automático a **Cloudflare Pages** en cada push a `main`.
- [x] **Entornos de Preview:** Generación de previews automáticos en Cloudflare para cada Pull Request.
- [ ] Validación formal offline final y cierre de checklist Lighthouse.

## Fase 5: Polish Y Expansiones (Backlog)

- [ ] Presets de compresion.
- [ ] Flujo batch global.
- [ ] Mejoras de accesibilidad AA ampliada.
- [ ] Optimizaciones de bundle y performance.
- [ ] Expansiones de conversion (segun roadmap de formatos).

## Fase 6: Actualizacion De Plataforma (Backlog Tecnico)

- [ ] Migracion a Astro 6.
- [ ] Actualizacion de integraciones y toolchain compatible (`@astrojs/react`, Vite y TypeScript).
- [ ] Ajustes de configuracion y validacion completa post-migracion (`typecheck`, `test`, `build` y PWA).
