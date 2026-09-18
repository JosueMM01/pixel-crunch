# Pruebas y CI

## Base

Vitest + Testing Library/happy-dom. Umbrales actuales: 80% statements/functions/lines y 70% branches. Typecheck, cobertura y build son checks distintos; no afirmar que pasan sin ejecutarlos.

CI usa pnpm con lockfile congelado y valida tipos, cobertura, build y auditoría. La auditoría remota continúa no bloqueante para evitar que una caída del registro invalide el pipeline; cualquier hallazgo real debe revisarse, sin auto-fix indiscriminado.

## Cobertura de 2.0

| Nivel | Casos principales |
| --- | --- |
| Unitarias | Capacidades, modelos, límites, errores, reintentos y presupuestos |
| Componentes | Carga/pegado, progreso, error, cancelación, descarga y ES/EN |
| Worker | Protocolo/id, mensajes inválidos/tardíos, timeout y terminación |
| Navegador | Rutas, Blob/Canvas, MIME/alfa, descarga y carga diferida |
| Modelo real | Calidad, memoria, GPU/CPU, caché y recuperación |

Simular inferencia en tests ordinarios; no simular Canvas en una prueba que pretende validar su encoder. Usar fixtures pequeñas con licencia clara, incluida salida PNG cuando se solicita AVIF.

Ejecutar modelos reales selectivamente al cambiar motor/assets y antes de release. Emulación móvil no certifica hardware real. Comparar calidad con tolerancias y revisión visual, no igualdad exacta GPU/CPU.

## Gates de PR

- Instalación reproducible; typecheck, test:coverage y build verdes.
- Assets/hashes/avisos verificados, archivos <=25 MiB y precache sin IA.
- Red sin descargas IA en landing/compresión/conversión; ninguna subida de imagen.
- Consola real, teclado, ES/EN, temas y responsive sin regresiones.
- Generación reproducible y sin archivos inesperados.

Conservar herramientas existentes; scripts Node pequeños para assets/budgets. Evaluar Playwright para E2E de navegador sin modelos en cada PR. El baseline de Fase 1 es 55 pruebas, 87.26% de statements y build estático correcto; medir el motor real en fases 4–7.
