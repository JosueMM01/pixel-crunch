# Privacidad

## Política del producto

Las imágenes se procesan exclusivamente en el navegador, sin API remota de procesamiento ni historial persistente. Imágenes, máscaras, nombres y EXIF no se envían a logs o telemetría.

Cloudflare sirve HTML, JS, WASM y modelos públicos. Descargar el motor no implica subir la imagen, pero sí tráfico normal de red y datos de conexión del alojamiento. No usar claims de «sin servidores» o «privacidad absoluta».

## Almacenamiento y offline

Se permiten preferencias de tema/idioma y caché de assets/modelos públicos. El Service Worker limita su caché runtime a la ruta versionada del motor; no intercepta ni almacena imágenes elegidas o pegadas. Las imágenes y los resultados permanecen en memoria hasta limpiar o abandonar la página.

Offline requiere aplicación y motor descargados; cuotas, modo privado o evicción pueden impedirlo. Procesamiento local no significa offline desde la primera visita.

## Pendientes de verificación

Fira Code se sirve desde el mismo origen. La preferencia de tema y la caché best-effort de recursos públicos del modelo son los únicos datos persistentes propios de la aplicación.

Antes de release: inspeccionar red/almacenamiento durante todos los flujos, confirmar cero subida de fotos y cero descarga IA al comprimir/convertir. No añadir analytics de usuarios en este alcance.
