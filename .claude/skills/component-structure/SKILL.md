---
name: component-structure
description: Folder and file conventions for creating UI components — one folder per component, a same-named main file, an index barrel, name-prefixed companion files, and rules for simple vs complex sub-components. Use whenever creating, splitting, moving or renaming a component, or adding a sub-component, style, types, hook, test or story file to one.
---

# Component Structure

Conventions for how components are laid out on disk. They are framework-agnostic: examples use
React + TypeScript (`.tsx` / `.ts`), but apply the same rules with whatever extensions the
project uses (`.jsx`, `.vue`, `.svelte`, etc.).

This skill covers **structure only** (folders, file names, exports). Styling approach, state
management and other technical choices come from the project's own skills.

## Rule 1: One folder per component

Every component lives in a folder named exactly like the component, in PascalCase.

Inside it there are always two main files:

| File | Purpose |
|---|---|
| `ComponentName.tsx` | The component itself. Same name as the folder plus the extension. |
| `index.ts` | Barrel that re-exports the component's public API. |

```
Button/
├── Button.tsx
└── index.ts
```

The `index` file exists so consumers import from the folder, never from the inner file:

```ts
// Correct
import { Button } from '@components/Button'

// Wrong
import { Button } from '@components/Button/Button'
```

### What `index.ts` contains

Only re-exports. No logic, no JSX, no side effects. Export the component and any types that
consumers need:

```ts
export { Button } from './Button'
export type { ButtonProps } from './Button.types'
```

Follow the project's existing export style (named or default) consistently. Prefer named
exports when no convention exists.

## Rule 2: Companion files are prefixed with the component name

Every additional file used by the component starts with the component name, followed by a dot
and a role suffix:

| File | Role |
|---|---|
| `ComponentName.module.css` | Scoped styles (CSS Modules) |
| `ComponentName.styles.css` / `.styles.ts` | Styles when not using CSS Modules |
| `ComponentName.types.ts` | Props and other types |
| `ComponentName.constants.ts` | Constants |
| `ComponentName.hooks.ts` | Hooks used only by this component |
| `ComponentName.utils.ts` | Helper functions used only by this component |
| `ComponentName.test.tsx` | Tests |
| `ComponentName.stories.tsx` | Stories / visual docs |

Create a companion file only when it is needed. Do not scaffold empty files "just in case".

```
Button/
├── Button.tsx
├── Button.module.css
├── Button.types.ts
├── Button.test.tsx
└── index.ts
```

Never use generic names like `styles.css`, `types.ts` or `utils.ts` inside a component folder:
the prefix keeps files identifiable in editor tabs, search results and stack traces.

## Rule 3: Sub-components live in a `components/` folder

A sub-component is a component used only by its parent. It goes inside a `components/` folder
within the parent's folder. Sub-components are **private** to the parent: they are not
re-exported from the parent's `index.ts` unless they are a deliberate part of its public API
(e.g. a compound component such as `Menu.Item`).

How a sub-component is laid out depends on its complexity.

### Simple sub-components: a single file

If a sub-component is small, has no logic worth isolating, and can reuse the parent's types,
create it as a single file directly in `components/`:

```
Card/
├── Card.tsx
├── Card.module.css
├── Card.types.ts
├── components/
│   ├── CardHeader.tsx
│   └── CardFooter.tsx
└── index.ts
```

A simple sub-component:

- Imports its types from the parent (`../Card.types`).
- May use the parent's style file if it only needs a few classes.
- Has no `index.ts` and no companion files of its own.

```tsx
// Card/components/CardHeader.tsx
import type { CardHeaderProps } from '../Card.types'
import styles from '../Card.module.css'

export function CardHeader({ title }: CardHeaderProps) {
  return <header className={styles.header}>{title}</header>
}
```

### Complex sub-components: same rules as a top-level component

If a sub-component needs any of the following, it gets its own folder and follows Rules 1–3
exactly like a top-level component:

- Its own types that do not belong in the parent.
- Its own styles file.
- Its own hooks, constants or utils.
- Its own sub-components.
- Its own tests.
- It is large enough that a single file is hard to read (as a guideline, ~150 lines).

```
GameCatalog/
├── GameCatalog.tsx
├── GameCatalog.module.css
├── GameCatalog.types.ts
├── components/
│   ├── CatalogEmptyState.tsx          ← simple
│   └── CatalogFilters/                ← complex
│       ├── CatalogFilters.tsx
│       ├── CatalogFilters.module.css
│       ├── CatalogFilters.types.ts
│       ├── components/
│       │   └── FilterChip.tsx
│       └── index.ts
└── index.ts
```

The parent imports complex sub-components from their folder
(`./components/CatalogFilters`), never from the inner file.

### Promoting a sub-component

- **Simple → complex:** when a single-file sub-component starts needing companion files, move
  it into its own folder with an `index.ts` and update the parent's import.
- **Sub-component → shared component:** when a sub-component is needed outside its parent,
  move it out of `components/` to wherever the project keeps shared components, and update
  every import. Do not import a sub-component from another component's `components/` folder.

## Naming

- Component folders and component files: **PascalCase** (`GameCard/GameCard.tsx`).
- Sub-component names should make their parent obvious when helpful (`CardHeader`,
  `CatalogFilters`), so they stay readable outside the folder context.
- The role suffix is always lowercase (`.types`, `.module`, `.hooks`).
- One component per main file. Small private helpers used only inside that file are fine.

## Checklist

Before finishing any component work, verify:

- [ ] The folder name matches the component name exactly.
- [ ] The main file is named `<Folder>.<ext>`.
- [ ] `index.ts` exists and only re-exports.
- [ ] Every companion file starts with the component name.
- [ ] No empty or unused companion files were created.
- [ ] Sub-components are in `components/`; simple ones are single files, complex ones are folders.
- [ ] No import reaches inside another component's folder (`Button/Button`, `Card/components/...`).
