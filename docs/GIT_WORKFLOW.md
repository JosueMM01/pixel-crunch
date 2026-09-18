# Flujo Git

- Revisar issue/board y requisitos antes de implementar; usar GitHub MCP cuando esté disponible.
- main y development son ramas protegidas. Crear rama desde development: feat/<issue>-descripcion, fix/<issue>-descripcion o docs/<issue>-descripcion.
- Commits Conventional Commits; PR revisable con alcance, pruebas y Closes #issue real. No push directo a ramas protegidas.
- Validar conforme a [TESTING_STRATEGY.md](TESTING_STRATEGY.md); los cambios solo documentales requieren revisar enlaces, coherencia y diff.
- No inventar resultados de consola/CI ni estados del tablero si faltan herramientas.

**Alcance autorizado ahora:** editar únicamente Markdown de documentación, incluido AGENTS.md, en la rama actual development. No cambiar src, instalar herramientas, modificar licencia ni hacer commit/push/PR. Esperar confirmación del usuario para el commit.

El orden y la aceptación del trabajo están en [PHASES.md](PHASES.md).
