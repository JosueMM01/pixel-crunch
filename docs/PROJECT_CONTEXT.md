# Contexto del Proyecto: Pixel Crunch

## Objetivo
Crear una herramienta web gratuita, open-source y privada que permita a los usuarios comprimir y convertir imágenes (JPG, PNG, WEBP, AVIF, etc.) directamente en su navegador sin subir archivos a un servidor.

## Filosofía de Desarrollo
1.  **Privacidad Primero:** Todo el procesamiento ocurre en el navegador (Client-Side).
2.  **Rendimiento:** La UI debe ser instantánea. Usamos Astro para lo estático y React solo para la interactividad.
3.  **Simplicidad:** "Hacer una cosa y hacerla bien". Sin login, sin bases de datos.
4.  **Experiencia Dual:** Un solo lugar para comprimir y convertir, alternando instantáneamente.
5.  **Educativo:** El código debe ser claro y comentado, ya que es un proyecto de aprendizaje.

## 🛠️ Herramientas de Desarrollo
Este proyecto usa herramientas MCP (Model Context Protocol) para automatización:
- **GitHub MCP:** Gestión de Issues, ramas y Pull Requests.
- **Chrome DevTools MCP:** Validación de errores en consola durante desarrollo.
- **GitHub Actions:** Pipeline de calidad (`quality.yml`) para asegurar la integridad en cada PR.

Ver [AGENTS.md](/AGENTS.md) para más detalles del flujo de trabajo.

## Funcionalidades Core
- **Flujo Dual:** Modo Compressor y Modo Converter en una sola experiencia integrada.
- **Compresión Inteligente:** Control de calidad con vista previa real (Antes/Después).
- **Conversión Versátil:** Soporte para múltiples formatos (JPG, PNG, WebP, AVIF, etc.).
- **Procesamiento en Segundo Plano:** Uso de Web Workers para no bloquear la UI.
- **Privacidad Total:** 100% client-side; tus imágenes nunca tocan un servidor.
- **Descarga Inteligente:** Descarga individual o empaquetado masivo en .ZIP.
- **Modo Oscuro/Claro:** Tema Monokai optimizado para desarrolladores.