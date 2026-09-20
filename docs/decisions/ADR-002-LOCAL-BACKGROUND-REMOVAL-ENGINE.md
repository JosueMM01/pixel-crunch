# ADR-002 — Motor local de eliminación de fondo

**Estado:** aceptada el 18/09/2026.

## Contexto

Quitar fondo necesita modelos grandes y puede agotar memoria. Debe mantener la resolución cuando sea viable, no afectar las herramientas existentes y funcionar sin enviar imágenes a un servidor.

## Decisión

- Ejecutar IMG.LY 1.7.0 y ONNX Runtime Web 1.21.0 en un worker independiente creado bajo demanda.
- Servir modelos/WASM 1.7.0 desde el mismo origen, generados en build desde un archivo con hash fijo; excluirlos de Git y del precache.
- Usar un worker por intento y terminarlo siempre. Limitar timeout y reintentos.
- En equipos capaces, intentar fp16 mediante WebGPU y luego CPU; terminar en quint8. En perfiles limitados, empezar por CPU + quint8.
- Excluir `isnet` completo de la cascada automática hasta que pruebas visuales justifiquen su descarga y memoria.
- Usar la API directa: conserva las dimensiones de salida y evita otra superficie de composición. Rechazar entradas fuera de límites en vez de reducirlas silenciosamente.

## Consecuencias

Compresión y conversión no cargan IA. El primer uso de quitar fondo requiere descargar recursos públicos y puede tardar; la caché no garantiza offline inicial. WebGPU es una optimización con fallback, no una promesa de compatibilidad. Los límites actuales son 25 MiB y 24 MP, o 12 MP en perfil limitado, y deben revisarse con mediciones multidispositivo.
