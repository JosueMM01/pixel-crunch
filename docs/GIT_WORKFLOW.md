# Flujo Git

- Revisar la fase, el PR activo y los requisitos antes de implementar; usar GitHub MCP cuando esté disponible.
- main y development son ramas protegidas. Crear una rama descriptiva desde development, por ejemplo `feat/separar-herramientas`, `fix/mime-exportacion` o `docs/licencias`.
- Commits Conventional Commits y PR revisable con alcance y pruebas. No hacer push directo a ramas protegidas.
- No crear issues para planificar fases. Las issues anteriores pueden cerrarse al completar su alcance, pero el seguimiento vigente vive en PHASES.md y en el PR activo.
- Validar conforme a [TESTING_STRATEGY.md](TESTING_STRATEGY.md); los cambios solo documentales requieren revisar enlaces, coherencia y diff.
- No inventar resultados de consola, CI o GitHub si faltan herramientas.

El orden y la aceptación del trabajo están en [PHASES.md](PHASES.md).
