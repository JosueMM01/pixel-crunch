# Pixel Crunch

Herramientas para procesar imágenes en el navegador, sin subirlas a una API de procesamiento.

## Estado

El código actual ofrece compresión y conversión, ES/EN, tema claro/oscuro y descargas individuales/ZIP. Usa Astro 7, React 19, Tailwind CSS 4 y pnpm 12; la licencia vigente es [MIT](LICENSE).

La modernización técnica de Pixel Crunch 2.0 está completa. Las rutas independientes para comprimir, convertir y quitar fondo, la inferencia local y el cambio coordinado de licencia continúan en las fases siguientes.

## Privacidad y compatibilidad

Las imágenes se procesan localmente. El sitio necesita descargar sus recursos; offline depende de la caché disponible. La entrada/salida de formatos depende de los codecs del navegador. [Privacidad](docs/PRIVACY.md) · [Compatibilidad](docs/BROWSER_COMPATIBILITY.md).

## Desarrollo

Requiere Node 24 y pnpm 12.4.2: `pnpm install --frozen-lockfile`, `pnpm dev` y `pnpm verify`.

Los checks son typecheck, test:coverage y build. [Especificaciones](docs/TECH_SPECS.md) · [Pruebas](docs/TESTING_STRATEGY.md).

## Documentación

- [Objetivo y alcance](docs/PROJECT_CONTEXT.md).
- [Fases y criterios de aceptación](docs/PHASES.md).
- [Arquitectura y carpetas](docs/ARCHITECTURE.md).
- [Eliminación de fondo](docs/BACKGROUND_REMOVAL.md).
- [Plan e issues](docs/IMPLEMENTATION_PLAN.md).
- [Licencias de la futura distribución](docs/LICENSING.md).
- [Flujo de contribución](docs/GIT_WORKFLOW.md).

[Aplicación](https://pixel-crunch.josuem01.dev/) · [Repositorio](https://github.com/JosueMM01/pixel-crunch)
