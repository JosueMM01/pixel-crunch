# Flujo de Trabajo con Git - Pixel Crunch

## 📋 Convenciones de Commits (Conventional Commits)

Usamos el formato: `tipo(scope): mensaje`

### Tipos de Commit:
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Formateo, punto y coma faltantes, etc (sin cambio de código)
- **refactor**: Refactorización (ni fix ni feat)
- **perf**: Mejora de performance
- **test**: Añadir o corregir tests
- **chore**: Mantenimiento (actualizar deps, config, etc)

### Ejemplos:
```bash
feat(compressor): add quality slider for compression
fix(upload): validate file size before processing
docs(readme): update installation instructions
chore(deps): update astro to 5.17.2
```

---

## 🌿 Estrategia de Branches

### Branch Principal: `main`
- **Protegida:** Solo se mergea vía Pull Request
- **Siempre estable:** Todo lo que esté aquí debe funcionar
- **Deploy automático:** Cada push a `main` = deploy a producción

### Branches de Desarrollo:

#### Features
```bash
feat/ui-base
feat/compression-engine
feat/downloads-history
feat/pwa-offline
```

#### Fixes
```bash
fix/upload-validation
fix/memory-leak
```

#### Documentación
```bash
docs/api-reference
docs/contributing-guide
```

---

## 🔄 Workflow por Fase

### Fase 1: UI Base

```bash
# 1. Crear branch desde main
git checkout main
git pull origin main
git checkout -b feat/ui-base

# 2. Hacer cambios incrementales
git add src/components/ui/Button.tsx
git commit -m "feat(ui): add Button component with variants"

git add src/components/ui/Card.tsx
git commit -m "feat(ui): add Card component for content containers"

# 3. Subir a GitHub
git push origin feat/ui-base

# 4. Crear Pull Request en GitHub
# Título: "feat: UI base components (Phase 1)"
# Descripción:
# - ✅ Button component with primary/secondary variants
# - ✅ Card component with shadow/border styles
# - ✅ Theme toggle working
# - ✅ Responsive layout

# 5. Mergear cuando esté aprobado
# (Usar "Squash and merge" o "Merge commit" según preferencia)

# 6. Actualizar local
git checkout main
git pull origin main
git branch -d feat/ui-base  # Borrar branch local
```

---

## 🚀 Comandos Útiles

### Setup Inicial (Solo una vez)
```bash
# Inicializar repositorio
git init

# Añadir remote
git remote add origin https://github.com/TU_USUARIO/pixel-crunch.git

# Primer commit
git add .
git commit -m "chore: initial project setup with Astro 5 + React 19 + TailwindCSS v4"

# Subir a main
git branch -M main
git push -u origin main
```

### Desarrollo Diario
```bash
# Actualizar main
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feat/nueva-funcionalidad

# Ver cambios
git status
git diff

# Commitear
git add .
git commit -m "feat(scope): descripción"

# Subir cambios
git push origin feat/nueva-funcionalidad
```

### Limpieza de Branches
```bash
# Ver branches locales
git branch

# Borrar branch local (ya mergeado)
git branch -d nombre-branch

# Borrar branch remoto
git push origin --delete nombre-branch

# Limpiar branches remotos borrados
git fetch --prune
```

### Revertir Cambios
```bash
# Deshacer cambios no commiteados
git restore archivo.tsx

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Deshacer último commit (borra cambios)
git reset --hard HEAD~1

# Revertir commit específico (crea nuevo commit)
git revert <commit-hash>
```

---

## 🔍 Code Review Checklist

Antes de hacer Pull Request, verificar:

### ✅ Código
- [ ] No hay `console.log` olvidados
- [ ] No hay comentarios TODO sin resolver
- [ ] TypeScript sin errores (`npm run build`)
- [ ] Imports ordenados y sin duplicados
- [ ] Nombres de variables descriptivos

### ✅ Funcionalidad
- [ ] Funciona en desarrollo (`npm run dev`)
- [ ] Funciona en build (`npm run build && npm run preview`)
- [ ] Probado en Chrome, Firefox, Safari
- [ ] Responsive (móvil, tablet, desktop)

### ✅ Calidad
- [ ] Componentes tienen props tipados
- [ ] Hooks tienen documentación JSDoc
- [ ] No hay duplicación de código
- [ ] Performance aceptable (sin lag)

### ✅ Git
- [ ] Commits descriptivos
- [ ] Branch actualizado con main
- [ ] No hay merge conflicts

---

## 🏷️ Versionado Semántico

Usamos [SemVer](https://semver.org/): `MAJOR.MINOR.PATCH`

```bash
# 0.1.0 - Primera versión funcional (MVP)
# 0.2.0 - Añadir compresión (Fase 2)
# 0.3.0 - Añadir descargas (Fase 3)
# 1.0.0 - PWA completa + Deploy (Fase 4)
# 1.1.0 - Nuevas features (Fase 5)
# 1.1.1 - Bug fixes
```

### Crear Release
```bash
# Actualizar package.json con nueva versión
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0

# Esto crea un tag automáticamente
git push origin main --tags
```

---

## 🚨 Situaciones Comunes

### "Olvidé hacer un branch y ya commiteé en main"
```bash
# 1. Crear branch desde donde estás
git checkout -b feat/mi-feature

# 2. Volver main al estado remoto
git checkout main
git reset --hard origin/main

# 3. Continuar trabajando en el branch
git checkout feat/mi-feature
```

### "Necesito cambios de main en mi branch"
```bash
# Opción 1: Rebase (recomendado)
git checkout feat/mi-feature
git rebase main

# Opción 2: Merge
git checkout feat/mi-feature
git merge main
```

### "Hice commits con mensajes malos"
```bash
# Reescribir último commit
git commit --amend -m "feat(scope): mensaje correcto"

# Reescribir últimos 3 commits (interactivo)
git rebase -i HEAD~3
# Cambiar 'pick' por 'reword' en los que quieras cambiar
```

---

## 📦 .gitignore (Archivo ya creado)

Ya tenemos un `.gitignore` completo que ignora:
- `node_modules/`
- `dist/`
- `.astro/`
- `.env*`
- Archivos del sistema (`.DS_Store`, etc)

No necesitas modificarlo a menos que añadas nuevas herramientas.

---

## 🎯 Best Practices

1. **Commits pequeños y frecuentes** > Commits gigantes
2. **Branches cortos** (máximo 3-5 días de vida)
3. **Pull Requests descriptivos** con capturas si es UI
4. **No mergear tu propio PR** sin review (en equipo)
5. **Borrar branches mergeados** para mantener limpio
6. **Escribir buenos mensajes** (tu yo del futuro te lo agradecerá)

---

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow vs GitHub Flow](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Semantic Versioning](https://semver.org/)
