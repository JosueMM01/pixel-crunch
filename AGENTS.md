# Reglas específicas de Pixel Crunch

## Producto

- Suite de imágenes: comprimir, convertir y quitar fondo, con rutas independientes y ES/EN.
- Procesamiento exclusivamente en navegador. Cloudflare Pages sirve estáticos; no subir imágenes ni añadir API de inferencia.
- Sin cuentas, historial de archivos ni persistencia de imágenes/EXIF. Se permiten preferencias y caché de modelos públicos.
- La IA no se descarga al visitar, comprimir o convertir; worker independiente bajo demanda.
- No reducir resolución silenciosamente. Mantener compresión GIF/SVG, conversión y batch/ZIP existentes.

## Antes de trabajar

Leer [contexto](docs/PROJECT_CONTEXT.md), [fases](docs/PHASES.md) y [arquitectura](docs/ARCHITECTURE.md). Las fases pendientes no describen funciones ya implementadas.

Las guías generales de TypeScript, React, Astro y estilos se gestionarán mediante skills revisadas e instaladas en fase 1 con autoskills; no asumir que ya están disponibles.

## Flujo y validación

- Revisar la issue asignada o el tablero antes de implementar. Usar GitHub MCP si está disponible.
- main y development están protegidas: ramas de trabajo desde development, commits Conventional Commits y PR con Closes #issue. Nunca push directo.
- Respetar instrucciones explícitas de alcance y autorización; no hacer commit cuando el usuario haya pedido esperar.
- Validar tipos, cobertura y build por separado. Revisar consola/red con Chrome DevTools MCP, ES/EN, teclado, claro/oscuro y 320/768/1024 px. Si falta una herramienta, informar la validación pendiente.
- Tras fase 1, usar pnpm y su único lockfile. Antes de añadir dependencias, justificar valor, compatibilidad, licencia y coste; auditar cambios del manifest/lockfile.
- Mantener avisos de terceros y fuentes de la versión distribuida. No cambiar licencia sin autorización.
- Documentar hechos verificados y límites; no afirmar compatibilidad, offline o rendimiento sin pruebas.
