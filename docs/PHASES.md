# Fases de Pixel Crunch 2.0

**Estado:** Fases 1–5 completadas y en producción; Fase 6 implementada en rama y pendiente de validación tras desplegar; Fase 7 pendiente. Cada fase incorpora pruebas y documentación.

## Fase 1 — Modernización del stack y skills

**Objetivo:** actualizar la base antes de añadir funcionalidades.

- [x] Registrar el estado previo y los checks disponibles.
- [x] Migrar a pnpm 12.4.2 con lockfile único e instalación congelada.
- [x] Actualizar a Astro 7.3.3, React 19.3.0, Tailwind CSS 4.3.3 y dependencias compatibles.
- [x] Fijar Node 24.13.0 y migrar CI a pnpm/Node 24.
- [x] Sustituir la integración PWA incompatible por manifest y Service Worker mínimos, sin precache.
- [x] Instalar y revisar ocho skills pertinentes mediante autoskills 0.3.6.
- [x] Reducir AGENTS.md a reglas propias del proyecto.
- [x] Validar instalación congelada, tipos, 55 pruebas, cobertura, build, auditoría, PWA, ES/EN y vistas 320/768/1024.

**Archivos:** package.json, lockfiles, configuraciones, CI, documentación y directorios de skills generados.
**Riesgos:** cambios mayores del compilador/bundler, peers, PWA e instalación pnpm.
**Resultado:** aceptación cumplida. `pnpm verify` y `pnpm audit --audit-level=high` pasan; el preview sirve HTML, manifest y SW correctamente y Brave no registra errores de consola. TypeScript 7 queda pendiente de compatibilidad oficial con `@astrojs/check`.

## Fase 2 — Licencia y distribución de terceros

**Objetivo:** preparar la distribución AGPL con procedencia clara.

- [x] Elegir AGPL-3.0-only; revisar copyright y material incorporado.
- [x] Confirmar versiones/licencias del motor, runtime y pesos, incluidas discrepancias de avisos.
- [x] Actualizar LICENSE, package/README, avisos y documentación coherentemente.
- [x] Definir inventario y acceso al código fuente correspondiente a cada release.

**Archivos:** LICENSE, package.json, README, avisos y docs.
**Pruebas:** inventario, textos y enlaces; revisión de artefactos distribuidos.
**Aceptación:** licencia propia inequívoca y derechos de redistribución trazables; sin eliminar atribuciones previas.
**Resultado:** Pixel Crunch usa `AGPL-3.0-only`; el inventario fija evidencia y hashes de los candidatos 1.7.0 sin incorporar todavía IA. La discrepancia ISNET se conserva de forma explícita y obliga a incluir tanto el aviso IMG.LY como Apache-2.0 al distribuir esos pesos.

## Fase 3 — Separar herramientas y rutas ES/EN

**Objetivo:** compresor y convertidor independientes con una entrada común.

- [x] Crear landing y rutas dedicadas conforme a ARCHITECTURE.md.
- [x] Separar ConverterPanel y el panel compresor de los componentes genéricos de carga.
- [x] Compartir layout, UI y mapa de rutas; mantener idioma al cambiar de herramienta.
- [x] Ajustar canonical/hreflang/sitemap y navegación accesible.
- [x] Corregir MIME de exportación y claims de formatos; preservar GIF/SVG, batch/ZIP y nombres localizados.

**Archivos:** pages, components/features, layouts, i18n, utilidades y tests.
**Pruebas:** navegación profunda, formatos reales, temas, teclado y 320/768/1024 px.
**Aceptación:** cada herramienta funciona por URL en ambos idiomas y carga solo lo necesario.
**Resultado:** landing documental y seis rutas de herramienta generadas como HTML estático; el header enlaza herramientas, descripción, tecnología y soporte. La página principal explica el flujo local, la frontera de red, diferencias, privacidad, formatos, límites y preguntas frecuentes en ES/EN. Compresor y convertidor hidratan islas separadas. Quitar fondo conserva una página informativa `noindex`, excluida temporalmente del sitemap y sin descargar código o modelos de IA. El convertidor limita sus claims a codecs del navegador y rechaza exportaciones cuyo MIME real no coincide.

## Fase 4 — Motor local de eliminación de fondo

**Objetivo:** inferencia estable en navegador sin API remota.

- [x] Fijar IMG.LY 1.7.0 y ONNX Runtime Web 1.21.0; preparar y verificar assets del mismo origen.
- [x] Crear worker independiente e imports dinámicos; una operación por worker.
- [x] Detectar adaptador WebGPU real, definir fallback CPU/WASM y empezar por quint8 en dispositivos limitados.
- [x] Elegir la API directa, que conserva dimensiones sin duplicar una composición manual sobre el original.
- [x] Añadir límites de bytes/píxeles, cancelación, timeout y reintentos acotados; no reducir resolución silenciosamente.

**Archivos:** lib/background-removal, worker, types, hook y scripts.
**Pruebas:** políticas, encabezados/dimensiones, protocolo, errores y ejecución real CPU/WASM con assets del mismo origen.
**Aceptación:** resultado correcto, recursos liberados y ruta CPU viable; cero descarga IA al comprimir/convertir.
**Resultado:** dependencias y assets fijados con hashes; 86 fragmentos cumplen el límite de 25 MiB. El cliente selecciona rutas adaptativas, termina cada worker y limita reintentos. CPU/WASM + `isnet_quint8` produjo PNG correcto dos veces en el entorno Chromium local. WebGPU y la matriz de dispositivos físicos permanecen en QA de Fase 7; no se anuncian como soporte validado.

## Fase 5 — Interfaz de quitar fondo

**Objetivo:** flujo sencillo y accesible en ES/EN.

- [x] Selección, drag & drop/pegado, preview y dimensiones.
- [x] Opciones de resolución explícitas, estados de descarga/procesamiento y cancelación.
- [x] Comparación antes/después, transparencia visible y exportación PNG/WebP con MIME validado.
- [x] Cola efímera de hasta 20 imágenes, cambio entre trabajos y eliminación individual.
- [x] Editor local de máscara con restaurar/borrar, tamaño de pincel y deshacer/rehacer.
- [x] Errores recuperables y diagnóstico técnico opcional.

**Archivos:** background-remover, página, traducciones y tests.
**Pruebas:** estados/acciones, teclado, formatos, tema y responsive.
**Aceptación:** flujo completo sin persistir imágenes y sin porcentajes ficticios de inferencia.
**Resultado:** las tres herramientas usan páginas operativas compactas. Quitar fondo mantiene hasta 20 imágenes y 200 MiB por sesión, una inferencia a la vez, resultados independientes, pegado, comparación y corrección local. Cache Storage conserva sólo recursos públicos del modelo de forma best-effort y distingue descarga de carga local. La fase fue aprobada y desplegada.

## Fase 6 — SEO, Cloudflare y rendimiento

**Objetivo:** facilitar descubrimiento en ES/EN y mantener una entrega estática eficiente.

- [x] Publicar títulos, descripciones, canonical/hreflang, contenido semántico y datos estructurados por ruta.
- [x] Declarar `WebSite` en la raíz para el nombre Pixel Crunch; mantener sitemap, robots y resumen `llms.txt`.
- [x] Verificar hashes, manifiesto, avisos y límite de 25 MiB de cada asset distribuido.
- [x] Configurar headers y caché inmutable para assets versionados; mantener SW y manifiesto revalidables.
- [x] Excluir IA del precache; caché runtime best-effort sólo de recursos públicos.
- [x] Eliminar React de la landing, autoalojar la fuente y fijar budgets de JS/CSS/assets en CI.
- [ ] Verificar headers, Search Console y métricas de campo después del despliegue.

**Archivos:** layout, páginas, contenido ES/EN, `public/_headers`, assets, scripts, CI y documentación SEO.
**Pruebas:** HTML generado, schema, rutas ES/EN, consola, responsive, caché fría/caliente y budgets.
**Aceptación:** páginas rastreables con metadatos coherentes; todos los archivos <=25 MiB; landing sin JS inicial; comprimir/convertir sin recursos IA; caché fallida sin impedir uso online.
**Resultado provisional:** las ocho rutas canónicas permanecen en el sitemap. La landing referencia 0 KiB de JS inicial; compresor 311.7 KiB, convertidor 215.8 KiB y quitar fondo 241.0 KiB minificados antes de compresión, con 73.3 KiB de CSS compartido. Los límites se validan en CI. La confirmación de headers y Core Web Vitals requiere el despliegue.

## Fase 7 — QA y release

**Objetivo:** publicar capacidades demostradas.

- [ ] Ejecutar checks completos, modelos reales y regresiones del compresor/convertidor.
- [ ] Validar navegadores/dispositivos objetivo, memoria repetida y calidad visual.
- [ ] Alinear README, versión, privacidad, compatibilidad y avisos con lo entregado.
- [ ] Preparar PR/release con resultados y rollback probado.

**Archivos:** tests/CI, README, docs y metadatos de release.
**Aceptación:** revisión aprobada, build estático validado y limitaciones publicadas; no anunciar como soportado lo no probado.

## Después de 2.0

Resize, crop, inspección/eliminación de metadatos y automatización batch de IA, según necesidad y rendimiento medido.
