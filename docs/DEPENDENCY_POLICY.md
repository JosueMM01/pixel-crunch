# Política de Dependencias - Pixel Crunch

## Principio base

Cada dependencia nueva debe justificar por qué no conviene resolver el problema con código propio o con APIs nativas del navegador.

## Cuándo sí aceptar un paquete

- Resuelve un problema complejo o costoso de implementar bien.
- Tiene mantenimiento activo y ecosistema sano.
- Tiene licencia compatible con el proyecto.
- Expone tipos TypeScript o buen soporte de tipos.
- Su impacto en bundle, mantenimiento y superficie de ataque es razonable.

## Cuándo preferir código propio

- La tarea es pequeña y el riesgo de implementación es bajo.
- La alternativa nativa existe y es suficiente.
- El paquete aporta poca diferencia frente al costo de dependencia.
- La funcionalidad se puede cubrir con utilidades internas simples.

## Revisión mínima antes de agregar una dependencia

1. Verificar alternativa nativa o interna.
2. Revisar licencia.
3. Revisar mantenimiento y comunidad.
4. Verificar si la dependencia trae tipos o si requiere `@types`.
5. Evaluar si rompe la filosofía client-side only y privacy first.
6. Ejecutar auditoría después de instalarla.

## Flujo recomendado

- Si la dependencia entra, documentar el motivo en la issue o PR.
- Si la dependencia no agrega valor claro, no se acepta.
- Si cambia `package.json` o `package-lock.json`, revisar `npm audit` y actualizar la documentación si aparece un riesgo nuevo.
