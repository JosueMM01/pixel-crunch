# Especificaciones técnicas

## Base y actualización

El checkout declara Astro 5.18.1, React 19.2.5, TypeScript 5.9.3, Tailwind v4 y npm. La fase 1 migrará a **pnpm 12 y Astro 7+ estables**, actualizando el resto a versiones compatibles.

Consulta al registro npm el 17/09/2026: Astro 7.3.3, pnpm 12.4.2 y autoskills 0.3.6. Son referencias verificadas, no versiones ya instaladas; volver a comprobar al ejecutar la fase. Mantener Node LTS compatible y fijar versiones/lockfile.

[Astro 7 y migración](https://astro.build/blog/astro-7/) · [pnpm publicado](https://registry.npmjs.org/pnpm/latest) · [Astro publicado](https://registry.npmjs.org/astro/latest).

## Desarrollo y CI

Actualmente: npm ci / npm run dev / npm run verify.
Tras fase 1: pnpm install --frozen-lockfile, pnpm dev, pnpm typecheck, pnpm test:coverage y pnpm build.

Typecheck es independiente de build. Conservar Vitest/Testing Library y ajustar integraciones/CI/PWA a la nueva base. No mezclar lockfiles ni dejar las versiones de Node distintas entre local, CI y Pages.

## Cloudflare Pages

Pages anuncia **solicitudes estáticas y transferencia ilimitadas**, sin una cuota mensual de GB publicada para este servicio. Es adecuado para servir modelos como assets de la herramienta; no se necesita un servidor de inferencia ni R2 por este motivo. [Oferta oficial](https://pages.cloudflare.com/).

Sigue existiendo un límite de **25 MiB por archivo** y 20.000 archivos en el plan Free. Verificar el conjunto elegido y usar fragmentos compatibles con el loader cuando haga falta. [Límites oficiales](https://developers.cloudflare.com/pages/platform/limits/).

La transferencia del alojamiento no elimina tiempo/datos móviles ni consumo de RAM del visitante. Descargar solo el modelo seleccionado, bajo demanda, y reutilizar caché disponible.

## Assets, PWA y seguridad

- Build estático a dist; assets propios versionados, hashes/manifiesto y avisos verificados.
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
| Modelos, tiempo y memoria | Medir por ruta CPU/GPU y dispositivo; fijar límites en fase 4 |
| Repetición y cancelación | Sin crecimiento sostenido de recursos ni resultados tardíos en UI |

No establecer techos de RAM o tiempos universales sin medición. Separar pruebas frías/calientes y memoria total del proceso de heap JavaScript.
