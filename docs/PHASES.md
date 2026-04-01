# Fases de Desarrollo - Pixel Crunch

## ✅ Fase 0: Setup Inicial (COMPLETADA)
- [x] Instalación de Astro 5.17.1
- [x] Configuración de React 19 con @astrojs/react
- [x] Setup TailwindCSS v4 con plugin Vite
- [x] Instalación de dependencias core
- [x] Configuración PWA con @vite-pwa/astro
- [x] Documentación inicial (PROJECT_CONTEXT.md, TECH_SPECS.md)

**Commit:** `chore: initial project setup`

---

## ✅ Fase 1: UI Base (COMPLETADA)
**Branch:** `feat/ui-base`  
**Objetivo:** Interfaz funcional sin lógica de compresión.

### ⚠️ FLUJO OBLIGATORIO:
1. Crear Issue en GitHub detallando los requisitos
2. Crear branch desde `development` con formato `feat/numero-issue-descripcion`
3. Desarrollar con commits atómicos usando Conventional Commits
4. Verificar con Chrome DevTools MCP que no hay errores
5. Crear Pull Request con `Closes #NumeroIssue` en la descripción
6. Solicitar revisión

### Tareas:
- [x] Crear componentes base en `src/components/ui/`
  - [x] Button.tsx
  - [x] Card.tsx
  - [x] Badge.tsx
- [x] Layout principal con Header/Footer
- [x] Componente `UploadZone.tsx` (react-dropzone)
- [x] Componente `ImagePreview.tsx` (mostrar miniaturas)
- [x] Sistema de tema oscuro con hook `useTheme.ts`
- [x] Sistema de notificaciones con Sonner

### Entregables:
- Usuario puede arrastrar archivos
- Ver previsualizaciones de imágenes
- Cambiar entre modo claro/oscuro
- Toasts funcionando

**Criterios de Aceptación:**
- UI responsive en móvil y desktop
- Accesibilidad básica (ARIA labels)
- Sin errores en consola

---

## 📦 Fase 2: Compresión Core
**Branch:** `feat/compression-engine`  
**Objetivo:** Implementar lógica de procesamiento.

### ⚠️ FLUJO OBLIGATORIO:
1. Crear Issue en GitHub detallando los requisitos
2. Crear branch desde `development` con formato `feat/numero-issue-descripcion`
3. Desarrollar con commits atómicos usando Conventional Commits
4. Verificar con Chrome DevTools MCP que no hay errores
5. Crear Pull Request con `Closes #NumeroIssue` en la descripción
6. Solicitar revisión

### Tareas:
- [ ] Hook `useImageCompression.ts` con browser-image-compression
- [ ] Web Worker para procesamiento en segundo plano
- [ ] Componente `CompressionProgress.tsx` (barra de progreso)
- [ ] Componente `CompressionStats.tsx` (mostrar tamaño original vs comprimido)
- [ ] Configuración de calidad (slider de 0.1 a 1.0)
- [ ] Soporte multi-formato (JPG, PNG, WebP)
- [ ] Pruebas unitarias e integración ligera para utilidades, hooks y componentes clave
- [ ] Workflow de GitHub Actions con build, tests y validación de calidad

### Entregables:
- Comprimir imágenes sin bloquear UI
- Mostrar progreso en tiempo real
- Comparación lado a lado (antes/después)
- Suite de pruebas base para evitar regresiones
- Validación automática en PR con CI

**Criterios de Aceptación:**
- Compresión funciona para JPG, PNG, WebP
- No se bloquea el hilo principal
- Estadísticas precisas (% de reducción)

---

## 💾 Fase 3: Persistencia y Descargas
**Branch:** `feat/downloads-history`  
**Objetivo:** Historial local y descarga de archivos.

### ⚠️ FLUJO OBLIGATORIO:
1. Crear Issue en GitHub detallando los requisitos
2. Crear branch desde `development` con formato `feat/numero-issue-descripcion`
3. Desarrollar con commits atómicos usando Conventional Commits
4. Verificar con Chrome DevTools MCP que no hay errores
5. Crear Pull Request con `Closes #NumeroIssue` en la descripción
6. Solicitar revisión

### Tareas:
- [ ] Hook `useLocalStorage.ts` para persistencia
- [ ] Componente `HistoryPanel.tsx` (últimas 5 compresiones)
- [ ] Descarga individual con file-saver
- [ ] Descarga masiva en ZIP con jszip
- [ ] Botón "Limpiar Historial"
- [ ] Formateo de fechas con date-fns

### Entregables:
- Historial persiste entre sesiones
- Descarga individual funciona
- Descarga múltiple en .zip funciona

**Criterios de Aceptación:**
- Máximo 5 items en historial (FIFO)
- ZIP contiene todas las imágenes comprimidas
- Manejo correcto de memoria (limpiar blobs)

---

## 🚀 Fase 4: PWA y Deploy
**Branch:** `feat/pwa-offline`  
**Objetivo:** App instalable y producción.

### ⚠️ FLUJO OBLIGATORIO:
1. Crear Issue en GitHub detallando los requisitos
2. Crear branch desde `development` con formato `feat/numero-issue-descripcion`
3. Desarrollar con commits atómicos usando Conventional Commits
4. Verificar con Chrome DevTools MCP que no hay errores
5. Crear Pull Request con `Closes #NumeroIssue` en la descripción
6. Solicitar revisión

### Tareas:
- [ ] Configurar Service Worker con vite-plugin-pwa
- [ ] Crear manifest.json con iconos (192x192, 512x512)
- [ ] Estrategia de caché (NetworkFirst para HTML, CacheFirst para assets)
- [ ] Página offline custom
- [ ] Meta tags para SEO
- [ ] Deploy en Vercel/Netlify
- [ ] Pruebas en Chrome DevTools (Lighthouse)
- [ ] Pruebas en dispositivos móviles reales

### Entregables:
- PWA instalable desde navegador
- Funciona 100% offline tras primera carga
- Score >90 en Lighthouse
- URL pública

**Criterios de Aceptación:**
- Pasa validación PWA de Chrome
- Manifest completo y válido
- Service Worker registrado correctamente

---

## 🎨 Fase 5: Polish y Optimizaciones (Futuro)
**Branch:** `feat/enhancements`  
**Objetivo:** Mejoras opcionales post-MVP.

### Ideas:
- [ ] Drag & Drop entre comparación (cambiar orden)
- [ ] Preset de compresión (Alta, Media, Baja)
- [ ] Conversión a AVIF (con @jsquash/avif)
- [ ] Análisis de metadatos EXIF
- [ ] Modo "Batch" con configuración global
- [ ] Animaciones con Framer Motion
- [ ] Tests con Vitest + Testing Library

---

## 📊 Métricas de Éxito
- **Rendimiento:** First Contentful Paint < 1s
- **Bundle Size:** JS total < 200KB (gzip)
- **Funcionalidad:** 100% cliente, 0% servidor
- **Accesibilidad:** AA WCAG (mínimo)
