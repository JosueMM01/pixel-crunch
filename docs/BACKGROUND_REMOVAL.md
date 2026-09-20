# Eliminación de fondo en navegador

## Motor entregado

Pixel Crunch fija `@imgly/background-removal` 1.7.0 y su peer `onnxruntime-web` 1.21.0. Los modelos, WASM y avisos 1.7.0 se preparan desde un archivo con SHA-256 fijo y se sirven desde `/vendor/background-removal/1.7.0/`. No existe API de inferencia.

La aplicación crea un worker exclusivo al ejecutar la operación. El worker importa IMG.LY bajo demanda, procesa una imagen y se termina tras éxito, error, cancelación o timeout. Landing, compresión y conversión no importan el motor ni solicitan modelos.

El Service Worker aplica cache-first únicamente a `/vendor/background-removal/1.7.0/dist/`. Los fragmentos descargados pueden persistir entre visitas hasta que el navegador los elimine por cuota o política. Antes de procesar, la interfaz comprueba si runtime y modelo de la primera ruta están completos para mostrar “Descargando modelo” o “Cargando modelo guardado”. La caché es una optimización, no un requisito para usar la herramienta.

## Política adaptativa

- Escritorio con adaptador WebGPU verificado: GPU + `isnet_fp16`, CPU + `isnet_fp16`, CPU + `isnet_quint8`.
- Móvil, memoria <=4 GiB o <=4 hilos lógicos: CPU + `isnet_quint8`; GPU + `isnet_quint8` queda como fallback si existe adaptador.
- Capacidades desconocidas sin señales de restricción: ruta de escritorio, sin asumir WebGPU.

`isnet` completo no entra en la cascada automática: pesa ~176 MiB reconstruido frente a ~88 MiB de fp16 y ~44 MiB de quint8, con mayor presión de memoria. Añadirlo requerirá demostrar una mejora visual que justifique el coste.

La detección solicita un adaptador real; el worker vuelve a comprobarlo. Un fallo GPU continúa en CPU. Una descarga puede reintentarse una vez en la misma ruta; falta de memoria salta a quint8. Entrada inválida y cancelación no reintentan. El timeout predeterminado es 120 segundos y nunca hay reintentos infinitos.

## Resolución y límites

La API directa de IMG.LY compone la máscara sobre la imagen de entrada y conserva sus dimensiones. El modelo segmenta internamente a 1024 × 1024, por lo que preservar la salida no significa inferencia por cada píxel original. Esta ruta es más simple que duplicar superficies para componer una máscara manual.

Se aceptan JPG, PNG y WebP de hasta 25 MiB. El encabezado real debe coincidir con el MIME y declarar dimensiones válidas antes de decodificar. El límite es 24 MP en equipos capaces y 12 MP en dispositivos restringidos. Pixel Crunch rechaza el archivo con un mensaje claro; no reduce silenciosamente a 1080 px.

PNG transparente es la salida del motor. La interfaz permite descargar PNG o WebP y valida el MIME real del encoder. **Original** conserva dimensiones; **Equilibrado** limita el lado mayor a 4096 px y es la opción recomendada; **Ligero** limita a 2048 px para priorizar estabilidad móvil. Las opciones limitadas nunca amplían una imagen.

## Progreso y errores

Antes de procesar una imagen, se consulta la caché de la ruta seleccionada. Si faltan recursos, aparece un aviso de descarga; si están completos, se omite. Los pesos miden 44,35 MB (quint8) o 88,15 MB (fp16); junto al runtime, una ruta inicial requiere aproximadamente 56,2–111,2 MB sin compresión HTTP. Un fallback puede necesitar recursos adicionales. La caché es best-effort.

El protocolo expone etapas reales: carga del runtime, descarga de assets, preparación, inferencia, aplicación de transparencia y codificación. Los porcentajes solo se muestran cuando IMG.LY entrega bytes actuales y totales. El cliente clasifica entrada inválida, descarga, memoria, WebGPU, inferencia, worker, timeout y cancelación.

La ruta CPU/WASM + `isnet_quint8` se ejecutó dos veces de extremo a extremo en el entorno Chromium local, usando assets del mismo origen y salida PNG. La matriz WebGPU y de navegadores físicos sigue siendo trabajo de QA; no se presenta como compatibilidad certificada.

La interfaz acepta selector múltiple, drag & drop y pegado desde el portapapeles. Mantiene hasta 20 imágenes y 200 MiB por sesión para cambiar entre trabajos sin perder resultados, pero procesa solo una imagen a la vez. Cada elemento se elimina de forma individual y todas las Blob URLs se revocan al borrarlo o desmontar la página. La vista muestra primero el resultado sobre damero; los botones Sin fondo/Original alternan una sola imagen, sin superponer el original bajo la transparencia. Las acciones quedan arriba y las miniaturas debajo.

El editor local permite restaurar sujeto, borrar fondo, ajustar pincel y deshacer/rehacer hasta 30 trazos. La edición se compone en un canvas sobre el resultado y solo se conserva como Blob en memoria. No persiste imágenes, máscaras, nombres ni historial, y no integra servicios externos.
