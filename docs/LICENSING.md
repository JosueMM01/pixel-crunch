# Licencias de Pixel Crunch

Pixel Crunch se distribuye bajo `AGPL-3.0-only` desde la Fase 2. Se eligió la variante *only* porque el artefacto auditado de IMG.LY incluye GNU AGPL versión 3 sin una concesión explícita “or later”. Las versiones publicadas previamente siguen disponibles bajo [su licencia MIT original](licenses/PIXEL-CRUNCH-MIT-HISTORICAL.txt); el cambio no las revoca.

## Alcance

- `LICENSE` gobierna el código propio de Pixel Crunch.
- Dependencias, modelos, WASM, documentación incorporada y assets conservan sus licencias.
- Las imágenes procesadas por el usuario no pasan a ser AGPL por usar la aplicación.
- No se requieren cabeceras extensas en cada archivo; el aviso visible, `LICENSE`, el historial y [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) concentran la información.

## Artefactos de eliminación de fondo

La Fase 4 fijó estas versiones. Las dependencias JS están en el lockfile; los modelos, WASM y avisos se generan durante el build desde el archivo auditado y no se guardan en Git. Otra versión exige repetir la auditoría.

| Componente | Evidencia auditada | Licencia/aviso |
| --- | --- | --- |
| `@imgly/background-removal` | 1.7.0; SHA-256 del `.tgz`: `0e7b6813978296b23bb9c5fa3d86a8f8e618b88174e08d6c61f230b0e18d13e6` | GNU AGPL v3; clasificado conservadoramente como `AGPL-3.0-only` |
| Assets `@imgly/background-removal-data` | paquete estático 1.7.0 de `https://staticimgly.com/@imgly/background-removal-data/1.7.0/package.tgz`; SHA-256: `a44fdaf4f3b06a952dcd9a61720bac1e6bc41392aa474e68863a2e54ca2d0df5` | paquete AGPL v3; incluye avisos de ONNX e ISNET |
| `onnxruntime-web` | peer estable 1.21.0 del motor; el paquete de datos usa un build dev compatible de 1.21.0 | MIT; conservar el aviso de Microsoft con JS/WASM |
| ISNET | `isnet`, `isnet_fp16`, `isnet_quint8`; IMG.LY señala como origen `xuebinqin/DIS` | IMG.LY declara MIT, mientras DIS publica Apache-2.0; conservar ambas evidencias y el texto Apache-2.0 |

El paquete npm `@imgly/background-removal-data` termina en 1.4.5 y no corresponde al motor 1.7.0. Para esa versión, IMG.LY publica el paquete de assets en `staticimgly.com`; no deben mezclarse.

El manifiesto 1.7.0 reconstruye siete recursos: dos módulos JS de ONNX (49,241 y 25,539 bytes), dos WASM (23,013,109 y 11,819,815 bytes) y tres modelos (`isnet_quint8` 44,348,940; `isnet_fp16` 88,152,708; `isnet` 176,149,806 bytes). Sus fragmentos tienen hashes SHA-256 como nombre. El `package.json` menciona `NOTICE.md`, pero el archivo no está presente en el tarball auditado; sí incluye `LICENSE.md` y `ThirdPartyLicenses.json`.

## Reglas de distribución

1. `scripts/prepare-background-removal-assets.mjs` fija versión y SHA-256 del archivo fuente, recalcula el hash y tamaño de cada fragmento declarado en `resources.json` y falla ante cualquier diferencia o archivo mayor de 25 MiB.
2. El build copia `LICENSE.md` y `ThirdPartyLicenses.json` de IMG.LY al directorio público versionado. El repositorio conserva además el aviso MIT de ONNX y el texto Apache-2.0 de DIS; no corrige silenciosamente la afirmación MIT del proveedor.
3. `pnpm-lock.yaml` fija las dependencias de cada release. Ejecutar `pnpm licenses list --prod --json` y revisar licencias nuevas antes de publicar.
4. Cada despliegue debe corresponder a un commit etiquetado y a un GitHub Release que conserve el código, lockfile, scripts, avisos y hashes utilizados. El enlace “Código fuente” de la interfaz apunta al repositorio público.
5. Una versión o asset diferente exige actualizar el inventario; una URL mutable no es evidencia suficiente.

Los detalles sobre obra combinada, titulares o sublicencias pueden requerir asesoría jurídica. Esta documentación registra evidencia técnica y adopta la conservación más estricta de avisos; no sustituye una opinión legal.

## Fuentes

[IMG.LY 1.7.0](https://www.npmjs.com/package/@imgly/background-removal/v/1.7.0) · [licencia IMG.LY](https://github.com/imgly/background-removal-js/blob/main/packages/web/LICENSE.md) · [avisos IMG.LY](https://github.com/imgly/background-removal-js/blob/main/packages/web/ThirdPartyLicenses.json) · [ONNX Runtime 1.21.0](https://github.com/microsoft/onnxruntime/blob/v1.21.0/LICENSE) · [DIS](https://github.com/xuebinqin/DIS) · [AGPL oficial](https://www.gnu.org/licenses/agpl-3.0.html).
