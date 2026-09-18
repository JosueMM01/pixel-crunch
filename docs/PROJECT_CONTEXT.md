# Objetivo de Pixel Crunch 2.0

## Producto

Suite pequeña, privada y gratuita para **comprimir, convertir y quitar fondo** en el navegador. Cada herramienta tendrá su propia ruta y versión ES/EN.

La base actual tiene compresión/conversión. Quitar fondo y la modernización siguen pendientes; [PHASES.md](PHASES.md) define la ejecución.

## Decisiones de producto

- Astro estático + React Islands; Cloudflare Pages distribuye aplicación y modelos, sin backend de procesamiento.
- Fase 1: pnpm 12, Astro 7+ y dependencias estables compatibles; skills mediante autoskills.
- Preferir tecnología reciente, estable y adecuada al proyecto; evitar versiones preliminares, dependencias innecesarias y funciones experimentales sin necesidad.
- Imágenes efímeras, sin cuentas ni historial. IA bajo demanda, aislada de las herramientas existentes.
- Resolución original cuando sea viable; reducción explícita y límites basados en pruebas.
- ES/EN, accesibilidad, temas claro/oscuro y responsive son parte del producto.

La idea inicial orienta el diseño; la implementación y las decisiones técnicas se confirman con documentación oficial, código y pruebas.

## Alcance inicial

Una imagen por operación de quitar fondo, comparación y exportación PNG/WebP. Preservar batch/ZIP del compresor. Resize, crop, EXIF, batch de IA y edición manual de máscaras quedan para fases posteriores.

MIT sigue vigente hasta ejecutar la migración aprobada a AGPL; ver [LICENSING.md](LICENSING.md).
