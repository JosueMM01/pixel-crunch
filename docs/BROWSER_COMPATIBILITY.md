# Compatibilidad

La matriz es objetivo de validación, no una certificación de funcionamiento actual de quitar fondo. La Fase 4 validó CPU/WASM + `isnet_quint8` de extremo a extremo en el entorno Chromium local; no sustituye pruebas en los navegadores y dispositivos siguientes.

| Navegador | Estrategia a validar |
| --- | --- |
| Chrome / Edge desktop | GPU donde funcione; fallback WASM |
| Firefox desktop | WASM; GPU solo tras validación |
| Safari desktop | WASM y evaluación GPU según versión |
| Chrome Android | Modelo pequeño/WASM; GPU según dispositivo |
| Samsung Internet | Pruebas propias; no asumir equivalencia con Chrome |
| Safari iOS | Perfil conservador y pruebas en dispositivo físico |

Publicar como funcional o funcional mediante fallback solo lo ensayado. Las rutas restantes serán experimentales o no soportadas. Sin Worker/WASM/canvas compatibles o recursos suficientes, deshabilitar quitar fondo sin afectar a las otras herramientas.

## Formatos

El convertidor acepta JPG/JPEG/JFIF, PNG, WebP, GIF y AVIF mediante codecs nativos. AVIF no es universal y la salida WebP/AVIF depende del navegador. Pixel Crunch comprueba el MIME devuelto por Canvas y rechaza fallbacks silenciosos; los GIF animados se convierten usando el primer fotograma.

Quitar fondo comienza con JPG/PNG/WebP y salida PNG/WebP transparente, según soporte real.

## QA mínimo

Registrar navegador/SO/hardware, CPU/GPU, caché fría/caliente, éxito, cancelación, formato/alfa/dimensiones y errores. Ensayar memoria limitada, offline parcial, ES/EN, teclado, tema y 320/768/1024 px.

La emulación móvil no reemplaza Android/iOS físicos. [Compatibilidad de ONNX Runtime](https://onnxruntime.ai/docs/get-started/with-javascript/web.html) orienta la selección, pero no valida automáticamente nuestro modelo.
