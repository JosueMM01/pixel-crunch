<p align="center">
  <img src="public/Logo.svg" width="112" alt="Pixel Crunch" />
</p>

<h1 align="center">Pixel Crunch</h1>

<p align="center">
  Suite pequeña para procesar imágenes directamente en el navegador.<br />
  Sin cuentas, sin API de procesamiento y sin subir tus archivos.
</p>

<p align="center">
  <a href="https://pixel-crunch.josuem01.dev/">Abrir Pixel Crunch</a> ·
  <a href="docs/ARCHITECTURE.md">Arquitectura</a> ·
  <a href="docs/PRIVACY.md">Privacidad</a> ·
  <a href="docs/PHASES.md">Roadmap</a>
</p>

## Herramientas

| Herramienta | Qué hace | Ruta ES / EN |
| --- | --- | --- |
| Comprimir | Reduce JPG, PNG, WebP, GIF y SVG, con comparación y batch/ZIP. | `/comprimir/` · `/en/compress/` |
| Convertir | Exporta a JPG, PNG, WebP o AVIF cuando el navegador lo soporta. | `/convertir/` · `/en/convert/` |
| Quitar fondo | Segmenta localmente, conserva hasta 20 imágenes por sesión y permite corregir la máscara. | `/quitar-fondo/` · `/en/remove-background/` |

## Privacidad desde el diseño

Cloudflare Pages sirve HTML, CSS, JavaScript, WASM y modelos públicos. Las imágenes se leen y transforman en el navegador; Pixel Crunch no tiene un endpoint que las reciba.

- Los archivos, resultados y correcciones permanecen en memoria durante la página y se eliminan individualmente o al cerrar la pestaña.
- El modelo de quitar fondo se descarga solo al ejecutar la herramienta y puede persistir en Cache Storage para visitas posteriores.
- El navegador puede eliminar esa caché según su cuota; offline no está garantizado en la primera visita.
- No existen cuentas, historial de imágenes ni persistencia de nombres o metadatos.

## Arquitectura

Pixel Crunch usa Astro 7 como sitio estático, React 19 para islas interactivas, Tailwind CSS 4 y workers separados para las tareas pesadas. El motor de quitar fondo carga IMG.LY y ONNX bajo demanda, selecciona WebGPU o CPU/WASM según capacidades y termina el worker después de cada intento.

```text
Cloudflare Pages ── entrega recursos públicos
        │
        ▼
Navegador ── procesa la imagen en memoria
        │
        ▼
Blob local ── descarga del resultado
```

Más detalles en [ARCHITECTURE.md](docs/ARCHITECTURE.md), [BACKGROUND_REMOVAL.md](docs/BACKGROUND_REMOVAL.md) y [BROWSER_COMPATIBILITY.md](docs/BROWSER_COMPATIBILITY.md).

## Desarrollo

Requiere Node 24 y pnpm 12.4.2.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
```

`pnpm verify` ejecuta typecheck, cobertura y build. El build prepara los assets de eliminación de fondo desde un archivo fijado por versión y SHA-256; los modelos generados no se guardan en Git.

## Licencia y terceros

Copyright © 2026 Josue Martinez Moreno (JosueMM01).

Pixel Crunch se distribuye bajo [GNU AGPL v3 únicamente](LICENSE) (`AGPL-3.0-only`). Las versiones publicadas anteriormente bajo MIT conservan esa licencia. Dependencias, modelos y assets mantienen sus propias licencias; consulta [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) y [LICENSING.md](docs/LICENSING.md).

## Documentación

La carpeta [`docs/`](docs) forma parte del repositorio porque registra decisiones, límites, licencias, arquitectura y criterios de aceptación que deben versionarse junto al código.

- [Objetivo y alcance](docs/PROJECT_CONTEXT.md)
- [Fases de implementación](docs/PHASES.md)
- [Pruebas y CI](docs/TESTING_STRATEGY.md)
- [Especificaciones técnicas](docs/TECH_SPECS.md)
- [Flujo de contribución](docs/GIT_WORKFLOW.md)
- [Decisiones arquitectónicas](docs/decisions)
