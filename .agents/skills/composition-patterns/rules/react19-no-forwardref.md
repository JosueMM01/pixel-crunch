---
title: React 19 API Changes
impact: MEDIUM
impactDescription: cleaner component definitions and context usage
tags: react19, refs, context, hooks
---

## React 19 API Changes

> **⚠️ React 19+ only.** Skip this if you're on React 18 or earlier.

In React 19, `ref` is now a regular prop (no `forwardRef` wrapper needed).
`useContext()` remains valid; `use()` is an alternative that can read context
conditionally.

**Incorrect (forwardRef in React 19):**

```tsx
const ComposerInput = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />
})
```

**Correct (ref as a regular prop):**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />
}
```

**Standard context read:**

```tsx
const value = useContext(MyContext)
```

**Alternative when a conditional context read is useful:**

```tsx
const value = use(MyContext)
```

Prefer `useContext()` for ordinary top-level context reads. Use `use()` when its
ability to read context conditionally makes the component clearer.
