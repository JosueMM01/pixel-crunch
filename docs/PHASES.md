# Fases de Pixel Crunch 2.0

**Estado:** planificación; ninguna fase nueva está implementada. Cada fase incorpora pruebas y documentación. Las versiones exactas se fijan al comenzar, usando releases estables compatibles.

## Fase 1 — Modernización del stack y skills

**Objetivo:** actualizar la base antes de añadir funcionalidades.

- [ ] Registrar el estado actual y ejecutar los checks disponibles para distinguir regresiones previas.
- [ ] Migrar a pnpm 12: fijar packageManager, generar pnpm-lock.yaml, retirar package-lock.json tras validar y ajustar scripts/comandos.
- [ ] Actualizar Astro a la última estable 7+ y revisar los pasos de migración 5 → 6 → 7; actualizar React, Tailwind, TypeScript, integraciones, pruebas y demás dependencias compatibles.
- [ ] Unificar Node compatible en local, CI y Cloudflare; revisar peers, configuración obsoleta y scripts de instalación permitidos.
- [ ] Migrar GitHub Actions y Pages a instalación reproducible con pnpm install --frozen-lockfile y pnpm build.
- [ ] Ejecutar npx autoskills tras actualizar el stack; seleccionar skills de Astro, React, TypeScript y Tailwind adecuadas a las versiones y al agente. Revisar procedencia, licencia y archivos generados.
- [ ] Mantener AGENTS.md con reglas propias del proyecto, sin duplicar tutoriales de las skills.
- [ ] Auditar dependencias y validar tipos, cobertura, build, PWA y compresión/conversión ES/EN.

**Archivos:** package.json, lockfiles, configuraciones, CI, documentación y directorios de skills generados.
**Riesgos:** cambios mayores del compilador/bundler, peers, PWA e instalación pnpm.
**Aceptación:** instalación limpia reproducible, checks verdes, preview estático funcional y skills pertinentes instaladas. No activar funciones experimentales por ser nuevas.

## Fase 2 — Licencia y distribución de terceros

**Objetivo:** preparar la distribución AGPL con procedencia clara.

- [ ] Elegir AGPL-3.0-only u or-later; revisar copyright y material incorporado.
- [ ] Confirmar versiones/licencias del motor, runtime y pesos, incluidas discrepancias de avisos.
- [ ] Actualizar LICENSE, package/README, avisos y documentación coherentemente.
- [ ] Definir inventario y acceso al código fuente correspondiente a cada release.

**Archivos:** LICENSE, package.json, README, avisos y docs.
**Pruebas:** inventario, textos y enlaces; revisión de artefactos distribuidos.
**Aceptación:** licencia propia inequívoca y derechos de redistribución trazables; sin eliminar atribuciones previas.

## Fase 3 — Separar herramientas y rutas ES/EN

**Objetivo:** compresor y convertidor independientes con una entrada común.

- [ ] Crear landing y rutas dedicadas conforme a ARCHITECTURE.md.
- [ ] Separar ConverterPanel y el panel compresor de los componentes genéricos de carga.
- [ ] Compartir layout, UI y mapa de rutas; mantener idioma al cambiar de herramienta.
- [ ] Ajustar canonical/hreflang/sitemap y navegación accesible.
- [ ] Corregir MIME de exportación y claims de formatos; preservar GIF/SVG, batch/ZIP y nombres localizados.

**Archivos:** pages, components/features, layouts, i18n, utilidades y tests.
**Pruebas:** navegación profunda, formatos reales, temas, teclado y 320/768/1024 px.
**Aceptación:** cada herramienta funciona por URL en ambos idiomas y carga solo lo necesario.

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
