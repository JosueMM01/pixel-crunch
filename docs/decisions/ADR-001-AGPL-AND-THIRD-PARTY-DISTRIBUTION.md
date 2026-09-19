# ADR-001 — AGPL y distribución de terceros

**Estado:** aceptada el 18/09/2026.

## Contexto

La eliminación de fondo prevista usa un motor IMG.LY publicado bajo GNU AGPL versión 3. Pixel Crunch necesita una licencia compatible y avisos verificables para código, WASM y modelos servidos al navegador.

## Decisión

- Pixel Crunch adopta `AGPL-3.0-only`; las versiones anteriores publicadas bajo MIT no cambian retroactivamente.
- Las dependencias y assets mantienen sus licencias y avisos. No se deduce la licencia de un modelo desde la biblioteca que lo carga.
- Cada release debe conservar commit/tag, lockfile, scripts, hashes y avisos suficientes para obtener el código fuente correspondiente.
- Los assets de IMG.LY 1.7.0 solo se generan si coinciden con el inventario de [LICENSING.md](../LICENSING.md); otra versión exige una auditoría nueva.

## Consecuencias

La interfaz ofrece acceso al código fuente y a la licencia. La preparación de modelos falla ante hashes, tamaños o avisos ausentes. La discrepancia entre el aviso MIT de IMG.LY para ISNET y Apache-2.0 en DIS se conserva y se trata incluyendo ambas evidencias, sin presentarla como una conclusión jurídica.
