# SEO y descubrimiento

## Estrategia de URLs e idioma

La raíz `/` permanece en español y `/en/` contiene la versión inglesa. Cada herramienta tiene una URL canónica propia en ambos idiomas. Cambiar ahora la raíz a inglés rompería continuidad y no mejora por sí solo el posicionamiento; `hreflang` permite que el buscador elija la variante adecuada.

| Intención | Español | English |
| --- | --- | --- |
| Comprimir imágenes | `/comprimir/` | `/en/compress/` |
| Convertir imágenes | `/convertir/` | `/en/convert/` |
| Quitar fondo | `/quitar-fondo/` | `/en/remove-background/` |

## Señales publicadas

- Título, descripción, canonical, `hreflang` y Open Graph únicos por página.
- `WebSite` en la raíz para solicitar el nombre **Pixel Crunch**; `WebPage`, `WebApplication`, breadcrumbs y FAQ cuando corresponden.
- Contenido HTML visible por herramienta, enlaces internos y una sola jerarquía de encabezados.
- Sitemap con las ocho rutas canónicas, `robots.txt` abierto y `llms.txt` como resumen auxiliar. `llms.txt` no sustituye el contenido ni garantiza inclusión en respuestas de un LLM.
- Página 404 con `noindex`.
- Landing sin JavaScript inicial de React; fuente versionada del mismo origen y budgets de build en CI.

Ninguna etiqueta garantiza indexación ni una posición concreta. El resultado depende también de recrawl, competencia, autoridad, enlaces y utilidad demostrada para la búsqueda.

## Después de desplegar

1. En Google Search Console, enviar `https://pixel-crunch.josuem01.dev/sitemap-index.xml`.
2. Inspeccionar la raíz y las seis rutas de herramientas; solicitar indexación si Google conserva una versión anterior.
3. Validar el JSON-LD de la raíz con Schema Markup Validator y confirmar que `WebSite.name` es `Pixel Crunch`.
4. Revisar semanalmente indexación, consultas, páginas, CTR y Core Web Vitals; cambiar títulos sólo con datos suficientes.
5. Verificar también Bing Webmaster Tools, porque otros buscadores y asistentes pueden usar índices distintos de Google.

Google puede tardar días o semanas en volver a procesar el nombre del sitio. Debe evaluarse después del recrawl, no inmediatamente después del despliegue.
