# Estrategia de Testing - Pixel Crunch

## Objetivo

Introducir una barrera temprana contra regresiones sin depender solo de revisión manual o del build. La idea es validar el comportamiento observable del código antes de mergear.

## Stack Adoptado

- **Runner:** Vitest
- **DOM de pruebas:** happy-dom
- **Componentes React:** Testing Library
- **Interacción de usuario:** @testing-library/user-event

## Qué se prueba primero

- **Utilidades puras** como `formatBytes` y `cn`.
- **Hooks** con estado y efectos, como `useTheme`.
- **Componentes con lógica** como `CompressionProgress` y, después, `Button` o `UploaderPanel`.

## Criterio práctico

- Si una función es pequeña y puede resolverse con Web APIs o lógica local, se implementa en código propio y se prueba.
- Si un paquete aporta valor claro y reduce riesgo, se acepta con revisión de licencia, mantenimiento y tipos.
- Los PRs no deberían entrar con una feature nueva sin pruebas que cubran el comportamiento nuevo.

## Validación mínima por PR

1. `npm run typecheck`
2. `npm run test:coverage`
3. `npm run build`
4. Revisión de consola sin errores con Chrome DevTools MCP cuando aplique interacción manual

## Cobertura inicial

La meta inicial recomendada es 80% global para mantener presión de calidad sin volver el flujo inmanejable. Si el módulo es nuevo y crítico, se espera cobertura alta en esa zona aunque el global todavía esté creciendo.
