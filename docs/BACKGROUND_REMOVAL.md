# Eliminación de fondo en navegador

## Motor

Usar una biblioteca estable de segmentación local, con IMG.LY/ONNX como candidata. Fijar versiones compatibles y resolver sus licencias antes de distribuir assets. No introducir un backend ni reimplementar inferencia sin una ventaja comprobada.

Worker exclusivo creado al pulsar Quitar fondo; imports dinámicos del motor/runtime y modelos del mismo origen. Una imagen a la vez, protocolo con id/etapa/resultado/error, cancelación y terminación al finalizar.

## Estrategia óptima por dispositivo

- Detectar adaptador GPU en el contexto real y comprobar que puede ejecutar el modelo; navigator.gpu por sí solo no basta.
- Preferir GPU cuando las pruebas demuestren mejora y estabilidad; CPU/WASM como fallback.
- En memoria limitada o capacidades desconocidas, comenzar con el modelo pequeño. Comparar isnet, fp16 y quint8 si la versión elegida los ofrece.
- Elegir por calidad, latencia, memoria y descarga; transferencia ilimitada en Pages no vuelve gratuita la descarga para el visitante.
- Recordar éxitos/fallos solo en memoria de sesión. No descargar todas las variantes ni reintentar rutas indefinidamente.
- Un error de entrada termina la operación; descarga transitoria puede reintentarse una vez. OOM solo permite una ruta más ligera o pedir reducción explícita.

La política final se fija con pruebas de fase 4, no con una cascada predeterminada. Terminar un worker ayuda a liberar recursos, pero no garantiza liberación instantánea de GPU/GC.

## Resolución y calidad

IMG.LY 1.7.0 infiere internamente a 1024 × 1024 y puede reescalar la máscara al tamaño de entrada. Verificarlo en la versión seleccionada; conservar dimensiones originales no equivale a segmentar cada píxel original. [Inferencia oficial](https://raw.githubusercontent.com/imgly/background-removal-js/main/packages/web/src/inference.ts).

Probar primero la API directa sobre originales acotados. Adoptar máscara temporal + composición sobre original solo si reduce memoria o mejora el resultado de forma medible.

Ofrecer **Original** y una resolución reducida explícita cuando sea necesaria. Validar bytes, dimensiones y área antes/después de decodificar; preservar orientación y alfa previo. Una sola superficie RGBA de 12 MP ocupa ~46 MiB, sin contar copias/modelo/runtime. No fijar límites solo por tamaño del JPEG ni reducir silenciosamente a 1080 px.

## Experiencia

Seleccionar/arrastrar/pegar → preview y dimensiones → Quitar fondo → descarga/preparación/inferencia → comparar → descargar.

PNG transparente por defecto; WebP solo si el encoder produce el MIME correcto. JPG/PNG/WebP como entradas iniciales; ampliar formatos tras validarlos. Sin animación ni batch de IA inicial.

Mostrar descarga real por bytes y estados de inferencia sin porcentajes inventados. Cancelar siempre disponible, errores accionables ES/EN, checkerboard, comparación accesible y diagnóstico avanzado opcional. No prometer recortes perfectos de cabello, transparencias o fondos complejos.

No persistir imágenes, máscaras ni nombres; cerrar bitmaps y revocar Blob URLs al limpiar.
