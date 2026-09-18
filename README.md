# Pixel Crunch

Herramientas para procesar imágenes en el navegador, sin subirlas a una API de procesamiento.

## Estado

El código actual ofrece compresión y conversión, ES/EN, tema claro/oscuro y descargas individuales/ZIP. Usa Astro 7, React 19, Tailwind CSS 4 y pnpm 12.

La modernización técnica y la migración de licencia de Pixel Crunch 2.0 están completas. Las rutas independientes y la eliminación de fondo local continúan en las fases siguientes.

## Privacidad y compatibilidad

Las imágenes se procesan localmente. El sitio necesita descargar sus recursos; offline depende de la caché disponible. La entrada/salida de formatos depende de los codecs del navegador. [Privacidad](docs/PRIVACY.md) · [Compatibilidad](docs/BROWSER_COMPATIBILITY.md).

## Desarrollo

Requiere Node 24 y pnpm 12.4.2: `pnpm install --frozen-lockfile`, `pnpm dev` y `pnpm verify`.

Los checks son typecheck, test:coverage y build. [Especificaciones](docs/TECH_SPECS.md) · [Pruebas](docs/TESTING_STRATEGY.md).

## Licencia

Copyright © 2026 Josue Martinez Moreno (JosueMM01). Pixel Crunch se distribuye bajo [GNU AGPL v3 únicamente](LICENSE) (`AGPL-3.0-only`). Las versiones publicadas anteriormente bajo MIT conservan esa licencia. Las dependencias, modelos y assets mantienen sus propias licencias; consulta [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) y [la política de distribución](docs/LICENSING.md).

El código fuente correspondiente a la versión desplegada debe estar disponible mediante el repositorio y el tag o release asociado; una rama mutable no sustituye ese registro.

## Documentación

- [Objetivo y alcance](docs/PROJECT_CONTEXT.md).
- [Fases y criterios de aceptación](docs/PHASES.md).
- [Arquitectura y carpetas](docs/ARCHITECTURE.md).
- [Eliminación de fondo](docs/BACKGROUND_REMOVAL.md).
- [Plan e issues](docs/IMPLEMENTATION_PLAN.md).
- [Licencias y distribución de terceros](docs/LICENSING.md).
- [ADR de licencia](docs/decisions/ADR-001-AGPL-AND-THIRD-PARTY-DISTRIBUTION.md).
- [Flujo de contribución](docs/GIT_WORKFLOW.md).

[Aplicación](https://pixel-crunch.josuem01.dev/) · [Repositorio](https://github.com/JosueMM01/pixel-crunch)
