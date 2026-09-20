# Especificaciones técnicas

## Base

El proyecto fija Astro 7.3.3, React/React DOM 19.3.0, Tailwind CSS 4.3.3, pnpm 12.4.2, TypeScript 6.0.3 y Node 24.13.0. Las versiones exactas y el lockfile hacen reproducible la instalación.

Consulta al registro npm el 17/09/2026: estas eran las versiones estables solicitadas. TypeScript 7.0.2 se dejó pendiente porque `@astrojs/check` 0.9.10 acepta TypeScript 5 o 6.

[Astro 7 y migración](https://astro.build/blog/astro-7/) · [pnpm publicado](https://registry.npmjs.org/pnpm/latest) · [Astro publicado](https://registry.npmjs.org/astro/latest).

## Desarrollo y CI

Comandos: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build` y `pnpm audit`.

Typecheck es independiente de build. Vitest 5 y Testing Library cubren la base actual. CI usa Node 24 y pnpm 12.4.2; no mezclar lockfiles.

## Cloudflare Pages

Pages anuncia **solicitudes estáticas y transferencia ilimitadas**, sin una cuota mensual de GB publicada para este servicio. Es adecuado para servir modelos como assets de la herramienta; no se necesita un servidor de inferencia ni R2 por este motivo. [Oferta oficial](https://pages.cloudflare.com/).

Sigue existiendo un límite de **25 MiB por archivo** y 20.000 archivos en el plan Free. Verificar el conjunto elegido y usar fragmentos compatibles con el loader cuando haga falta. [Límites oficiales](https://developers.cloudflare.com/pages/platform/limits/).

La transferencia del alojamiento no elimina tiempo/datos móviles ni consumo de RAM del visitante. Descargar solo el modelo seleccionado, bajo demanda, y reutilizar caché disponible.

## Assets, PWA y seguridad

- Build estático a dist; assets propios versionados, hashes/manifiesto y avisos verificados.
- PWA mínima mediante manifest y Service Worker propio, sin precache. `@vite-pwa/astro` se retiró porque su release estable no declara Astro 7 y el plugin Vite directo no generó un SW válido dentro del build de Astro.
- Immutable solo para URLs de contenido inmutable; HTML/SW deben poder revalidarse.
- MIME correcto para JS/WASM; los fragmentos reconstruidos por el loader conservan el MIME del manifiesto.
- IA fuera del precache, incluidos JS diferidos, WASM y modelos. Caché runtime best-effort; una cuota agotada no debe impedir procesar online.
- Probar upgrades/rollback del SW y recursos de clientes antiguos.
- Probar CSP con workers/Blob/WASM; activar COOP/COEP únicamente si el multithreading aporta una mejora validada.
- Autohospedar fuentes con sus avisos o usar fuentes del sistema.

[Headers](https://developers.cloudflare.com/pages/configuration/headers/) · [Despliegue ONNX](https://onnxruntime.ai/docs/tutorials/web/deploy.html).

## Presupuestos de aceptación

| Métrica | Criterio |
| --- | --- |
| IA en landing/compresión/conversión | 0 solicitudes y 0 bytes |
| Assets individuales | <=25 MiB |
| Operaciones IA simultáneas | 1 |
| Precache IA | 0 archivos |
| JS inicial de herramientas existentes | No aumentar por el motor IA; comparar con baseline de fase 1 |
| Entrada de quitar fondo | <=25 MiB; <=24 MP o <=12 MP en perfil limitado |
| Timeout del motor | 120 s por intento salvo configuración explícita |
| Modelos, tiempo y memoria | Medir por ruta CPU/GPU y dispositivo antes del release |
| Repetición y cancelación | Sin crecimiento sostenido de recursos ni resultados tardíos en UI |

No establecer techos de RAM o tiempos universales sin medición. Separar pruebas frías/calientes y memoria total del proceso de heap JavaScript.
