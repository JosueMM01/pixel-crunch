# Dependencias y skills

Elegir las versiones estables más recientes que funcionen juntas y aporten valor al producto. No usar betas ni actualizar peers incompatibles solo por alcanzar el número más alto.

## Fase 1

Migrar todo a pnpm 12 y Astro 7+, actualizar dependencias/configuración/CI y fijar un único lockfile. Revisar cambios mayores, licencias y auditoría; retirar paquetes/configuración sin uso comprobado.

Ejecutar **npx autoskills** después de actualizar el stack. Seleccionar skills pertinentes y comprobar contenido, origen, licencia y versión tecnológica; no aceptar todo automáticamente ni sobrescribir reglas propias de AGENTS.md. No se instala nada en esta tarea documental.

autoskills 0.3.6 declara CC-BY-NC-4.0: revisar sus términos como herramienta de desarrollo y, separadamente, los de cada skill. Esto no establece por sí solo la licencia de Pixel Crunch. [Proyecto oficial](https://github.com/midudev/autoskills) · [Metadatos del paquete](https://registry.npmjs.org/autoskills/latest).

## Motor y herramientas adicionales

IMG.LY/ONNX resuelven inferencia compleja; fijar versiones compatibles y comprobar assets/avisos según [LICENSING.md](LICENSING.md). Revisar también transitivas.

Preferir Node/Web APIs para verificaciones pequeñas. Añadir Playwright solo al automatizar pruebas que necesitan navegador real; no añadir gestor de estado, decoder o biblioteca de caché sin necesidad demostrada.
