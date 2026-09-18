# Fases de Pixel Crunch 2.0

**Estado:** Fases 1–2 completadas el 18/09/2026; Fases 3–7 pendientes. Cada fase incorpora pruebas y documentación.

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
**Resultado:** landing y seis rutas de herramienta generadas como HTML estático; compresor y convertidor hidratan islas separadas. Quitar fondo conserva una página informativa `noindex`, excluida temporalmente del sitemap y sin descargar código o modelos de IA. El convertidor limita sus claims a codecs del navegador y rechaza exportaciones cuyo MIME real no coincide.

## Fase 4 — Motor local de eliminación de fondo

**Objetivo:** inferencia estable en navegador sin API remota.

- [ ] Elegir versión estable compatible de IMG.LY/ONNX y preparar assets del mismo origen.
- [ ] Crear worker independiente e imports dinámicos; una operación en vuelo.
- [ ] Validar GPU real y fallback CPU/WASM; comparar calidad, memoria y tiempo antes de fijar orden de modelos.
- [ ] Comparar API directa frente a máscara temporal aplicada al original; elegir el flujo más simple que cumpla límites.
- [ ] Añadir límites de imagen, cancelación, timeout y reintentos acotados; no reducir resolución silenciosamente.

**Archivos:** lib/background-removal, worker, types, hook y scripts.
**Pruebas:** políticas/protocolo y ejecución real con orientación/alfa, imágenes grandes y fallos.
**Aceptación:** resultado correcto, recursos liberados y ruta CPU viable; cero descarga IA al comprimir/convertir.

## Fase 5 — Interfaz de quitar fondo

**Objetivo:** flujo sencillo y accesible en ES/EN.

- [ ] Selección, drag & drop/pegado, preview y dimensiones.
- [ ] Opciones de resolución explícitas, estados de descarga/procesamiento y cancelación.
- [ ] Comparación antes/después, transparencia visible y exportación PNG/WebP verificada.
- [ ] Errores recuperables y diagnóstico técnico opcional.

**Archivos:** background-remover, página, traducciones y tests.
**Pruebas:** estados/acciones, teclado, formatos, tema y responsive.
**Aceptación:** flujo completo sin persistir imágenes y sin porcentajes ficticios de inferencia.

## Fase 6 — Cloudflare, caché y rendimiento

**Objetivo:** entrega estática eficiente y comportamiento offline honesto.

- [ ] Verificar hashes, manifiesto, avisos y tamaño de cada asset; fragmentar modelos cuando sea necesario.
- [ ] Configurar headers/MIME y URLs inmutables versionadas.
- [ ] Excluir IA del precache; caché runtime best-effort solo de recursos públicos.
- [ ] Probar cuota agotada, descarga interrumpida, actualización del SW y rollback sin perder trabajos activos.
- [ ] Medir bundle/red/memoria y ajustar estrategia; revisar CSP y fuentes remotas.

**Archivos:** astro.config, public/_headers, scripts, assets y CI.
**Pruebas:** preview Pages, solicitudes, caché fría/caliente/offline parcial y budgets.
**Aceptación:** todos los archivos <=25 MiB, rutas existentes sin tráfico IA y caché fallida sin impedir uso online.

## Fase 7 — QA y release

**Objetivo:** publicar capacidades demostradas.

- [ ] Ejecutar checks completos, modelos reales y regresiones del compresor/convertidor.
- [ ] Validar navegadores/dispositivos objetivo, memoria repetida y calidad visual.
- [ ] Alinear README, versión, privacidad, compatibilidad y avisos con lo entregado.
- [ ] Preparar PR/release con resultados y rollback probado.

**Archivos:** tests/CI, README, docs y metadatos de release.
**Aceptación:** revisión aprobada, build estático validado y limitaciones publicadas; no anunciar como soportado lo no probado.

## Después de 2.0

Resize, crop, inspección/eliminación de metadatos, batch de IA y edición manual de máscaras, según necesidad y rendimiento medido.
