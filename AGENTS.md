# 🤖 Instrucciones para Agentes IA (GitHub Copilot, Claude, etc.)

Este archivo contiene reglas específicas para que los asistentes de IA trabajen de manera consistente con este proyecto.

⚠️ **INSTRUCCIÓN CRÍTICA:** Estás operando en un entorno profesional con ramas protegidas y flujo estricto de GitHub.

## 🛠️ Herramientas MCP Requeridas
Debes utilizar activamente las herramientas conectadas:
1.  **GitHub MCP:** Para leer Issues, crear ramas y gestionar Pull Requests.
2.  **Chrome DevTools MCP:** Para VERIFICAR errores en consola antes de dar una tarea por terminada. **Prohibido adivinar errores.**

## 🔄 Flujo de Trabajo OBLIGATORIO (GitHub Flow)

Tu ciclo de trabajo es autónomo, pero debes seguir estos pasos en orden estricto:

### 1. Inicio de Tarea (Gestión de Issues)
- **Consulta:** Revisa el tablero del proyecto (Project Board) o lista las Issues abiertas.
- **Selección:** Si no se te asigna una, toma la siguiente Issue en la columna "To Do".
- **Lectura:** Lee detenidamente los requisitos de la Issue. Si no son claros, PREGUNTA al usuario antes de escribir código.

### 2. Configuración de Entorno
- **Ramas Protegidas:** `main` y `development` son DE SÓLO LECTURA. Nunca intentes hacer push directo a ellas.
- **Crear Rama:** Crea una rama nueva para la tarea específica basándote en la rama `development`.
  - Formato: `feat/numero-issue-descripcion-corta` o `fix/numero-issue-descripcion`.
  - Ejemplo: `git checkout -b feat/2-upload-zone`

### 3. Desarrollo y Validación (Ciclo Iterativo)
- Escribe el código necesario en incrementos pequeños.
- Haz commits frecuentes usando **Conventional Commits**:
  - `feat(ui): agregar estructura base`
  - `style(ui): ajustar sombras con tailwind`
- **VALIDACIÓN CONTINUA:** USA Chrome DevTools MCP regularmente durante el desarrollo para verificar que no hay errores en consola.
- **Nota:** No necesitas pedir permiso para cada commit local, pero sí debes informar qué estás haciendo.

### 4. Verificación Final
- Antes de hacer push y crear el PR:
  - ✅ Ejecuta `npm run build` para verificar TypeScript
  - ✅ USA Chrome DevTools MCP para verificar que no hay errores rojos en consola
  - ✅ Verifica que el código funciona en móvil y desktop
- Si hay errores, corrígelos. **No entregues código roto.**

### 5. Finalización (Pull Request)
- Cuando termines los requisitos de la Issue:
  1. Haz push de tu rama a GitHub.
  2. Crea el Pull Request usando las herramientas MCP de GitHub.
  3. **IMPORTANTE:** En la descripción del PR, incluye `Closes #NumeroDeIssue` para que GitHub automatice el tablero.
  4. Solicita revisión del usuario e informa que el trabajo está listo.

---

## 📋 Contexto del Proyecto

**Nombre:** Pixel Crunch  
**Tipo:** Progressive Web App (PWA) para compresión de imágenes  
**Stack:** Astro 5 + React 19 + TailwindCSS v4  
**Filosofía:** Client-side only, privacidad primero, offline-first  

Lee estos archivos ANTES de sugerir cambios:
- `/docs/PROJECT_CONTEXT.md` - Filosofía y objetivos
- `/docs/TECH_SPECS.md` - Stack tecnológico
- `/docs/ARCHITECTURE.md` - Decisiones de diseño
- `/docs/PHASES.md` - Roadmap de desarrollo

---

## 🎯 Reglas de Código

### TypeScript
- ✅ **SIEMPRE** usa TypeScript estricto
- ❌ **NUNCA** uses `any` (usa `unknown` y valida)
- ✅ Define interfaces para props de componentes
- ✅ Exporta tipos desde `/src/types/`

**Ejemplo:**
```typescript
// ❌ MAL
function compress(file: any) { }

// ✅ BIEN
interface CompressOptions {
  quality: number;
  maxWidth: number;
}

function compress(file: File, options: CompressOptions): Promise<Blob> { }
```

---

### React

#### Componentes
- ✅ Usa componentes funcionales (no clases)
- ✅ Props tipadas con TypeScript
- ✅ Usa hooks para estado local
- ✅ Documenta props complejas con JSDoc

**Estructura de componente:**
```tsx
import type { FC } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

/**
 * Botón reutilizable con variantes de estilo
 */
export const Button: FC<ButtonProps> = ({ 
  variant = 'primary', 
  onClick, 
  children 
}) => {
  return (
    <button 
      onClick={onClick}
      className={variant === 'primary' ? 'bg-blue-600' : 'bg-gray-600'}
    >
      {children}
    </button>
  );
};
```

#### Hooks
- ✅ Custom hooks empiezan con `use`
- ✅ Usa `useCallback` para funciones pasadas como props
- ✅ Usa `useMemo` solo si hay cálculos pesados
- ❌ No abuses de `useEffect` (pregunta si hay una alternativa)

---

### Astro

#### Islands Architecture
- ✅ Usa componentes `.astro` para contenido estático
- ✅ Usa React (`client:load`) solo para interactividad
- ❌ No hidrates componentes estáticos innecesariamente

**Ejemplo:**
```astro
---
// Layout.astro - HTML estático
import Header from '../components/layout/Header.astro';
import CompressorEngine from '../components/features/CompressorEngine.tsx';
---

<Header />  <!-- HTML puro, 0 JS -->
<CompressorEngine client:load />  <!-- React, hidratado en cliente -->
```

#### Directivas de hidratación:
- `client:load` - Para componentes que deben estar listos inmediatamente
- `client:idle` - Para componentes no críticos (carga cuando el navegador está idle)
- `client:visible` - Para componentes debajo del fold (carga cuando son visibles)

---

### TailwindCSS

#### Estilos
- ✅ Usa clases de utilidad de TailwindCSS
- ✅ Usa `clsx` o `cn()` para condicionales
- ❌ No uses `@apply` a menos que sea absolutamente necesario
- ✅ Usa modo oscuro con `dark:` prefix

**Ejemplo:**
```tsx
import { clsx } from 'clsx';

<button 
  className={clsx(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
    variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Click me
</button>
```

#### Responsive Design
- ✅ Mobile-first (sin prefijo = móvil, `md:` = tablet, `lg:` = desktop)
- ✅ Prueba siempre en 320px, 768px, 1024px

---

## 🚫 Restricciones

### NO Uses:
1. **Backend/Servidor** - Todo debe correr en el cliente
2. **Bases de datos externas** - Solo localStorage
3. **APIs de terceros** - Solo Web APIs nativas (Canvas, File API, etc)
4. **jQuery** o librerías antiguas
5. **CSS-in-JS** (styled-components, emotion) - Usa TailwindCSS
6. **Redux/Zustand** - Context API es suficiente para este proyecto
7. **Axios** - Usa `fetch` nativo

### Privacidad CRÍTICA:
- ❌ **NUNCA** subas imágenes a un servidor
- ❌ **NUNCA** uses analytics que trackeen usuarios
- ❌ **NUNCA** guardes imágenes en localStorage (solo metadata)

---

## 🛠️ Herramientas y Debugging

### Chrome DevTools (MCP)
Durante el desarrollo, usa activamente Chrome DevTools MCP para:
1. ✅ Verificar que no hay errores en consola (obligatorio antes de cada commit)
2. ✅ Revisar la pestaña Network si hay problemas de carga
3. ✅ Usar Lighthouse para verificar PWA/Performance
4. ❌ **NO adivines errores** - léelos de las herramientas reales

### Errores Comunes:
```typescript
// ❌ Error típico: "Cannot read property of undefined"
const filename = file.name;  // Si file es undefined, crashea

// ✅ Solución: Optional chaining
const filename = file?.name ?? 'unknown.jpg';
```

---

## 📦 Estructura de Archivos

### Dónde poner cada cosa:

```
src/
├── components/
│   ├── ui/              ← Componentes reutilizables (Button, Card)
│   ├── features/        ← Lógica de negocio (Compressor, Uploader)
│   └── layout/          ← Header, Footer, etc
├── hooks/               ← Custom hooks (useImageCompression)
├── lib/                 ← Utilidades (compression.ts, utils.ts)
├── types/               ← TypeScript interfaces
└── workers/             ← Web Workers
```

### Naming Conventions:
- **Componentes:** PascalCase (`Button.tsx`, `ImagePreview.tsx`)
- **Hooks:** camelCase con `use` (`useTheme.ts`, `useLocalStorage.ts`)
- **Utilidades:** camelCase (`formatBytes.ts`, `downloadFile.ts`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `ALLOWED_FORMATS`)

---

## 🔄 Git Workflow

### Commits:
Usa [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat(compressor): add quality slider
fix(upload): validate file types correctly
docs(readme): update installation steps
chore(deps): update astro to 5.17.2
```

### Branches:
```bash
feat/ui-base           # Nueva funcionalidad
fix/memory-leak        # Corrección de bug
docs/api-reference     # Documentación
```

Ver `/docs/GIT_WORKFLOW.md` para más detalles.

---

## 🧪 Testing (Futuro)

Cuando llegue la fase de testing:
- ✅ Unit tests para hooks y utilidades (Vitest)
- ✅ Component tests para UI (Testing Library)
- ❌ No necesitamos E2E para MVP (solo si el proyecto crece)

---

## 💡 Sugerencias para Agentes

### Antes de sugerir código:
1. ¿Has leído `/docs/ARCHITECTURE.md`?
2. ¿Este cambio es client-side only?
3. ¿Estás usando TypeScript correctamente?
4. ¿El código es accesible (ARIA labels)?
5. ¿Funciona en modo oscuro?

### Cuando generes componentes:
1. Incluye tipos/interfaces
2. Añade JSDoc si la función es compleja
3. Usa TailwindCSS (no CSS inline)
4. Piensa en responsive design
5. Considera el modo oscuro

### Cuando necesites información adicional:
1. ✅ Lee los archivos relevantes en `/docs/`
2. ✅ Revisa el código existente para mantener consistencia
3. ✅ Usa las herramientas MCP para verificar el estado real
4. ❌ No asumas causas de errores sin verificar con Chrome DevTools MCP

---

## 📚 Recursos de Referencia

- **Astro:** https://docs.astro.build
- **React 19:** https://react.dev
- **TailwindCSS v4:** https://tailwindcss.com/docs
- **browser-image-compression:** https://github.com/Donaldcwl/browser-image-compression
- **TypeScript:** https://www.typescriptlang.org/docs

---

## ✅ Checklist Final

Antes de entregar código, verifica:
- [ ] TypeScript sin errores (`npm run build`)
- [ ] Componentes tienen tipos
- [ ] No hay `console.log` olvidados
- [ ] Funciona en modo oscuro
- [ ] Es responsive (móvil + desktop)
- [ ] No rompe la privacidad (client-side only)
- [ ] Commit message sigue Conventional Commits

---

<div align="center">
  <sub>Este archivo mejora la consistencia del código generado por IA</sub>
</div>
