# Contexto del Proyecto: Image Optimizer (Client-Side)

## Objetivo
Crear una herramienta web gratuita, open-source y privada que permita a los usuarios comprimir y convertir imágenes (JPG, PNG, WEBP) directamente en su navegador sin subir archivos a un servidor.

## Filosofía de Desarrollo
1.  **Privacidad Primero:** Todo el procesamiento ocurre en el navegador (Client-Side).
2.  **Rendimiento:** La UI debe ser instantánea. Usamos Astro para lo estático y React solo para la interactividad.
3.  **Simplicidad:** "Hacer una cosa y hacerla bien". Sin login, sin bases de datos.
4.  **Educativo:** El código debe ser claro y comentado, ya que es un proyecto de aprendizaje.

## 🛠️ Herramientas de Desarrollo
Este proyecto usa herramientas MCP (Model Context Protocol) para automatización:
- **GitHub MCP:** Gestión de Issues, ramas y Pull Requests
- **Chrome DevTools MCP:** Validación de errores en consola durante desarrollo

Ver [AGENTS.md](/AGENTS.md) para más detalles del flujo de trabajo.

## Funcionalidades Core
- Drag & Drop de imágenes.
- Conversión masiva a WebP.
- Compresión con pérdida controlada.
- Descarga individual o en .ZIP (si son múltiples archivos).
- Modo Oscuro/Claro automático.