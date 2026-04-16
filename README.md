# 🎨 Pixel Crunch

> Comprime y optimiza imágenes directamente en tu navegador. 100% privado, sin servidores.

[![Astro](https://img.shields.io/badge/Astro-5.17.1-FF5D01?style=flat&logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Características

- 🔒 **100% Privado** - Tus imágenes nunca salen de tu navegador
- ⚡ **Súper Rápido** - Procesamiento en Web Workers (no bloquea la UI)
- 📦 **Sin Backend** - Todo funciona en el cliente (Client-Side)
- 🌙 **Modo Oscuro** - Tema claro/oscuro automático
- 📱 **PWA** - Instálalo como app y úsalo offline
- 🧩 **Flujo Dual en Home** - Modo Compressor y modo Converter en una sola experiencia
- 🎯 **Múltiples Formatos (Compresión)** - Soporta JPG/JPEG/JFIF, PNG, WebP y SVG
- 🔄 **Conversión en Cliente** - Convierte JPG/PNG/WebP/SVG/GIF a JPG/PNG/WebP/AVIF

---

## 🚀 Estado del Proyecto

🚧 **En desarrollo activo** - Actualmente en **Fase 2** (Compresión Core + UX/UI Home)

📍 **Demo en vivo:** https://pixel-crunch.josuem01.dev/

✅ **Despliegue:** Cloudflare Pages (activo)
✅ **CI/CD:** GitHub Actions (validación automática de tipos, tests y build)

### Roadmap:
- ✅ **Fase 0:** Setup inicial (Astro + React + TailwindCSS)
- ✅ **Fase 1:** UI Base (Completada)
- 🔄 **Fase 2:** Compresión Core + UX/UI Home con Flujo Dual (En progreso avanzado)
  - ✅ Compresión JPG/PNG/WebP/SVG funcional.
  - ✅ Descarga individual y ZIP (Corregido).
  - ✅ Motor de conversión inicial funcional (incluye estrategia GIF estático/animado por primer fotograma).
- ⏳ **Fase 3:** Persistencia e Historial
- ✅ **Fase 4:** PWA e Infraestructura de Deploy (activa)

Ver [PHASES.md](./docs/PHASES.md) para detalles completos.

---

## 🛠️ Stack Tecnológico

### Core
- **[Astro 5](https://astro.build)** - Framework web moderno con Islands Architecture
- **[React 19](https://react.dev)** - Solo para componentes interactivos
- **[TailwindCSS v4](https://tailwindcss.com)** - Estilos con utilidades

### Librerías Clave
- **[browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)** - Compresión de imágenes
- **[react-dropzone](https://react-dropzone.js.org/)** - Drag & Drop de archivos
- **[jszip](https://stuk.github.io/jszip/)** - Empaquetado en .zip
- **[file-saver](https://github.com/eligrey/FileSaver.js)** - Descarga de archivos
- **[sonner](https://sonner.emilkowal.ski/)** - Notificaciones toast
- **[lucide-react](https://lucide.dev)** - Iconos

---

## 📦 Instalación

### Requisitos Previos
- **Node.js** 24.x o superior
- **npm** / **pnpm** / **yarn**

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/JosueMM01/pixel-crunch.git
cd pixel-crunch

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321) en tu navegador.

---

## 🧞 Comandos Disponibles

| Comando                | Acción                                             |
| :--------------------- | :------------------------------------------------- |
| `npm install`          | Instala dependencias                               |
| `npm run dev`          | Inicia servidor local en `localhost:4321`          |
| `npm run typecheck`    | Valida tipos y archivos Astro con `astro check`    |
| `npm run test:coverage`| Ejecuta pruebas con cobertura                       |
| `npm run verify`       | Ejecuta typecheck + tests + build                  |
| `npm run build`        | Genera build de producción en `./dist/`            |
| `npm run preview`      | Previsualiza build local antes de deploy           |
| `npm run astro ...`    | Ejecuta comandos de Astro CLI (`astro add`, etc)  |

---

## 📂 Estructura del Proyecto

```
pixel-crunch/
├── docs/                      # Documentación del proyecto
│   ├── PROJECT_CONTEXT.md     # Contexto y filosofía
│   ├── TECH_SPECS.md          # Especificaciones técnicas
│   ├── PHASES.md              # Roadmap por fases
│   ├── ARCHITECTURE.md        # Decisiones de arquitectura
│   └── GIT_WORKFLOW.md        # Flujo de trabajo Git
├── public/                    # Assets estáticos (favicon, icons)
├── src/
│   ├── components/            # Componentes Astro y React
│   │   ├── ui/                # Componentes base (Button, Card)
│   │   ├── features/          # Lógica de negocio (Compressor, Uploader)
│   │   └── layout/            # Header, Footer
│   ├── hooks/                 # Custom React Hooks
│   ├── layouts/               # Layouts de Astro
│   │   └── Layout.astro       # Layout principal
│   ├── lib/                   # Utilidades y helpers
│   ├── pages/                 # Páginas (rutas)
│   │   └── index.astro        # Página principal
│   ├── styles/
│   │   └── global.css         # Estilos globales + TailwindCSS
│   └── types/                 # TypeScript types/interfaces
├── astro.config.mjs           # Configuración de Astro
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 ¿Por qué este proyecto?

### Problemas que resuelve:
1. **Privacidad**: Herramientas online suben tus fotos a sus servidores
2. **Velocidad**: Apps nativas requieren instalación
3. **Costo**: Servicios premium cobran por compresión

### Nuestra solución:
- ✅ Todo el procesamiento en tu navegador (JavaScript + Canvas API)
- ✅ Sin instalación, solo abre la web
- ✅ Gratis y open source

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Ver [GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md) para entender el flujo de trabajo.

### Pasos rápidos:
1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feat/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push al branch (`git push origin feat/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia **MIT** - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🙏 Agradecimientos

- [Astro](https://astro.build) por el increíble framework
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) por la librería de compresión
- Comunidad de [TailwindCSS](https://tailwindcss.com) por las utilidades CSS

---

## 📞 Contacto

¿Preguntas o sugerencias? Abre un [issue](https://github.com/JosueMM01/pixel-crunch/issues) o contacta a [@JosueMM01](https://github.com/JosueMM01).

---

<div align="center">
  <sub>Hecho con ❤️ y mucho ☕</sub>
</div>
