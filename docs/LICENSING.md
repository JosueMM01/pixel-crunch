# Licencias de Pixel Crunch

**Vigente: MIT.** La migración prevista es AGPL v3; aún no se ha cambiado LICENSE.

## Qué se debe distinguir

| Componente | Estado |
| --- | --- |
| Pixel Crunch | Elegir AGPL-3.0-only u or-later antes de migrar |
| @imgly/background-removal | AGPL v3 en la versión 1.7.0 revisada |
| @imgly/background-removal-data | Paquete AGPL; revisar licencias de su contenido |
| onnxruntime-web | MIT en 1.21.0; conservar avisos de runtime/binarios |
| Modelos | Confirmar procedencia/licencia de los pesos concretos, no inferirla de la biblioteca |

Los avisos IMG.LY identifican ISNET como MIT, mientras el origen DIS publica Apache-2.0. Resolver la discrepancia mediante versión, hash y evidencia de los pesos seleccionados antes de redistribuirlos. No significa que la inferencia necesite servidor ni que el modelo sea necesariamente AGPL.

## Migración en fase 2

- Revisar titularidad y conservar atribuciones MIT/terceros; las versiones MIT ya distribuidas no se revocan.
- Actualizar LICENSE, package/lockfile, README y documentación de forma consistente.
- Publicar inventario con componente, versión/origen, licencia, hash y texto/NOTICE aplicable, incluidos modelos/WASM/fuentes.
- Facilitar fuentes y scripts correspondientes a la versión desplegada; no enlazar únicamente a una rama que cambia.
- Preservar avisos en los artefactos distribuidos; no añadir cabeceras extensas a todos los archivos por rutina.

AGPL permite uso comercial; no convierte automáticamente las fotografías del usuario en obras AGPL. El alcance de obra combinada y las obligaciones exactas de código correspondiente requieren interpretación jurídica del conjunto distribuido; separar workers no elimina ese análisis.

## Fuentes

[IMG.LY: licencia](https://github.com/imgly/background-removal-js/blob/main/packages/web/LICENSE.md) · [Avisos](https://raw.githubusercontent.com/imgly/background-removal-js/main/packages/web/ThirdPartyLicenses.json) · [ONNX 1.21.0](https://raw.githubusercontent.com/microsoft/onnxruntime/v1.21.0/LICENSE) · [DIS](https://raw.githubusercontent.com/xuebinqin/DIS/main/LICENSE.md) · [AGPL oficial](https://www.gnu.org/licenses/agpl-3.0.html).

Revalidar todos los artefactos al elegir versiones para la implementación.
