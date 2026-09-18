# Dependencias y skills

Elegir las versiones estables más recientes que funcionen juntas y aporten valor al producto. No usar betas ni actualizar peers incompatibles solo por alcanzar el número más alto.

## Base instalada

El proyecto usa pnpm 12.4.2, Astro 7.3.3, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 6.0.3 y Node 24. `pnpm-lock.yaml` es el único lockfile. TypeScript 7 no se adoptó porque `@astrojs/check` aún declara compatibilidad hasta TypeScript 6.

autoskills 0.3.6 instaló las skills revisadas de Astro, React, TypeScript, Tailwind, accesibilidad, SEO, composición y diseño frontend. Se descartaron las de backend Node y una guía de Vitest 3 incompatible con Vitest 5. El inventario y hashes están en `skills-lock.json`.

autoskills 0.3.6 declara CC-BY-NC-4.0: revisar sus términos como herramienta de desarrollo y, separadamente, los de cada skill. Esto no establece por sí solo la licencia de Pixel Crunch. [Proyecto oficial](https://github.com/midudev/autoskills) · [Metadatos del paquete](https://registry.npmjs.org/autoskills/latest).

## Motor y herramientas adicionales

IMG.LY/ONNX resuelven inferencia compleja; fijar versiones compatibles y comprobar assets/avisos según [LICENSING.md](LICENSING.md). Revisar también transitivas.

Preferir Node/Web APIs para verificaciones pequeñas. Añadir Playwright solo al automatizar pruebas que necesitan navegador real; no añadir gestor de estado, decoder o biblioteca de caché sin necesidad demostrada.
