# Objetivo de Pixel Crunch 2.0

## Producto

Suite pequeña, privada y gratuita para **comprimir, convertir y quitar fondo** en el navegador. Cada herramienta tendrá su propia ruta y versión ES/EN.

La base actual tiene compresión, conversión y eliminación local de fondo en rutas independientes con el stack modernizado. La interfaz de quitar fondo está implementada en Fase 5 y pendiente de aprobación visual. [PHASES.md](PHASES.md) define la ejecución.

## Decisiones de producto

- Astro estático + React Islands; Cloudflare Pages distribuye aplicación y modelos, sin backend de procesamiento.
- Base: pnpm 12.4.2, Astro 7.3.3, React 19.3.0 y Tailwind CSS 4.3.3; skills seleccionadas mediante autoskills.
- Preferir tecnología reciente, estable y adecuada al proyecto; evitar versiones preliminares, dependencias innecesarias y funciones experimentales sin necesidad.
- Imágenes efímeras, sin cuentas ni historial. IA bajo demanda, aislada de las herramientas existentes.
- Resolución original cuando sea viable; reducción explícita y límites basados en pruebas.
- ES/EN, accesibilidad, temas claro/oscuro y responsive son parte del producto.

La idea inicial orienta el diseño; la implementación y las decisiones técnicas se confirman con documentación oficial, código y pruebas.

## Alcance inicial

Una imagen por operación de quitar fondo, comparación y exportación PNG/WebP. Preservar batch/ZIP del compresor. Resize, crop, EXIF, batch de IA y edición manual de máscaras quedan para fases posteriores.

Pixel Crunch usa `AGPL-3.0-only`. Las dependencias y modelos conservan sus licencias; ver [LICENSING.md](LICENSING.md) y [los avisos de terceros](../THIRD_PARTY_NOTICES.md).
