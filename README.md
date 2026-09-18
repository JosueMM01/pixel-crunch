# Pixel Crunch

Herramientas para procesar imágenes en el navegador, sin subirlas a una API de procesamiento.

## Estado

El código actual ofrece compresión y conversión, ES/EN, tema claro/oscuro y descargas individuales/ZIP. Usa Astro 5, React y Tailwind v4; la licencia vigente es [MIT](LICENSE).

**Pixel Crunch 2.0 está planificado, no implementado:** Astro 7+ estable, pnpm 12, rutas independientes para comprimir/convertir/quitar fondo, inferencia local y migración de licencia coordinada.

## Privacidad y compatibilidad

Las imágenes se procesan localmente. El sitio necesita descargar sus recursos; offline depende de la caché disponible. La entrada/salida de formatos depende de los codecs del navegador. [Privacidad](docs/PRIVACY.md) · [Compatibilidad](docs/BROWSER_COMPATIBILITY.md).

## Desarrollo

Actualmente: npm ci, npm run dev y npm run verify. La fase 1 migrará comandos, CI y despliegue a pnpm; todavía no existe esa migración.

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
