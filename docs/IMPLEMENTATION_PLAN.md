# Plan de Pixel Crunch 2.0

## Dirección

Modernizar primero; después separar herramientas e incorporar eliminación de fondo local. La ejecución detallada vive en [PHASES.md](PHASES.md), sin duplicarla aquí.

Decidido: pnpm 12/Astro 7+ estables y skills en fase 1; landing y rutas independientes ES/EN; compresor/convertidor separados; worker IA bajo demanda; Pages estático sin backend de procesamiento.

## Hallazgos que siguen siendo relevantes

- Ambas herramientas actuales se hidratan en la home, incluso el panel oculto.
- La conversión depende de codecs del navegador y no valida suficientemente el MIME real exportado.
- Existen trabajo pesado en hilo principal y batch sin límite explícito de concurrencia; no trasladar esa estrategia a IA.
- La PWA configurada no demuestra offline completo.
- Versiones/claims del README y package estaban desalineados; la versión de release se resolverá al implementar.
- Licencias de pesos y artefactos requieren trazabilidad antes de distribución.

La auditoría previa fue estática; pruebas y benchmarks se ejecutarán en las fases correspondientes. El diseño se decide con evidencia del proyecto y proveedores.

## Issues propuestas

No creadas en GitHub. Cada fila representa una unidad de trabajo revisable; criterios completos en la fase indicada.

| Issue | Objetivo y tareas | Aceptación | Dependencia |
| --- | --- | --- | --- |
| Modernizar stack y skills | pnpm, Astro, dependencias, CI/Pages y autoskills | Instalación limpia y checks verdes; fase 1 | Ninguna |
| Preparar licencia AGPL | Licencia propia, pesos y avisos/fuentes | Procedencia resuelta; fase 2 | Versiones seleccionadas |
| Separar herramientas ES/EN | Rutas, carpetas, navegación, SEO y MIME | Flujos actuales sin regresión; fase 3 | Fase 1 |
| Integrar motor local | Worker, límites, resolución, GPU/WASM | Resultado real y cancelación; fase 4 | Fases 1–2 |
| Crear UI de quitar fondo | Carga, comparación, estados y exportación | Accesible ES/EN; fase 5 | Rutas y contrato del motor |
| Validar assets/PWA/Pages | Hashes, headers, caché y budgets | Sin IA inicial, preview válido; fase 6 | Motor/artefactos |
| QA y release | Dispositivos, calidad, docs y release | Gates completos; fase 7 | Todas las anteriores |

Rutas y motor pueden avanzar en paralelo tras sus dependencias. UI y caché también cuando estén fijados sus contratos; no requiere trabajo paralelo si no aporta ahorro.

## Decisiones pendientes

- Variante AGPL y procedencia concreta de los pesos.
- Versiones exactas compatibles al implementar, incluidas skills.
- Modelo/orden CPU-GPU y límites de resolución según pruebas.
- Dispositivos mínimos soportados y presupuesto medido de memoria/tiempo.

## ADR propuestos

Registrar cuando se cierren: distribución AGPL y terceros; procesamiento local/efímero; páginas por herramienta/idioma; worker IA bajo demanda; resolución y estrategia adaptativa; assets versionados con caché opcional.

Carpetas, comandos y criterios operativos no necesitan ADRs separados.
