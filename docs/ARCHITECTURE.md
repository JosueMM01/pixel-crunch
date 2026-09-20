# Arquitectura

## Diseño 2.0

Sitio estático con landing y una página por herramienta. React solo hidrata la herramienta activa; no hay router SPA ni backend de inferencia.

| Herramienta | Español | Inglés |
| --- | --- | --- |
| Inicio | / | /en/ |
| Comprimir | /comprimir/ | /en/compress/ |
| Convertir | /convertir/ | /en/convert/ |
| Quitar fondo | /quitar-fondo/ | /en/remove-background/ |

Cada ruta tiene canonical, hreflang, título y contenido propios. El selector de idioma mantiene la herramienta. Navegación mediante enlaces accesibles; un mapa tipado de rutas evita duplicación.

## Estructura de carpetas

Las herramientas tienen módulos independientes. El motor y la interfaz de eliminación de fondo viven en módulos propios.

- **src/**
  - **components/**
    - **layout/** — Header/Footer comunes.
    - **ui/** — componentes visuales compartidos.
    - **features/**
      - **uploader/** — selección, drag & drop y preview reutilizables.
      - **compressor/** — panel y controles exclusivos de compresión.
      - **converter/** — panel y controles exclusivos de conversión.
      - **background-remover/** — carga/pegado, opciones, progreso, comparación y descarga.
  - **hooks/** — coordinación y estado por herramienta.
  - **lib/**
    - **compression/** — utilidades específicas de compresión.
    - **conversion/** — decodificación, formatos y exportación.
    - **background-removal/** — capacidades, estrategia, límites y cliente del worker.
    - **formats.ts / utils.ts** — utilidades realmente compartidas.
  - **workers/** — compression.worker.ts y background-removal.worker.ts independientes; conversión tendrá worker solo si el perfilado lo justifica.
  - **types/** — contratos y mensajes.
  - **i18n/** — es.json, en.json y mapa de rutas.
  - **layouts/** — Layout.astro y layout común de herramientas.
  - **pages/** — landing y páginas de herramientas ES/EN.
  - **styles/** — estilos globales.
- **public/vendor/background-removal/** — modelos/runtime versionados generados durante el build y excluidos de Git.
- **scripts/** — preparación y verificación de assets.
- **tests/** — configuración y pruebas de navegador; unitarias junto a los módulos.
- **docs/** — especificaciones y fases.

Mover archivos al separar responsabilidades, no crear carpetas vacías ni abstracciones para funciones inexistentes.

## Carga y flujo

La isla de cada herramienta usa `client:load` para responder al usuario. El cliente de quitar fondo es liviano: el worker se crea y el motor se importa solo al ejecutar la operación. IMG.LY, ONNX y los modelos no se importan desde módulos compartidos ni se precargan.

Una operación de IA a la vez, con id, progreso, resultado/error y cancelación. Terminar worker y liberar Blob URLs/bitmaps al finalizar o abandonar. El Service Worker conserva únicamente fragmentos públicos del modelo en Cache Storage; las imágenes no entran en esa caché. El worker de compresión permanece independiente.

Estado de imágenes en memoria; avisar al navegar con trabajo pendiente. Compartir UI y helpers pequeños, no el estado o motor de cada herramienta.
