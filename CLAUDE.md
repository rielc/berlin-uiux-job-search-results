# Agents: Component & Export Conventions

This file documents the component & export conventions for this repository (React + Astro files). Follow these rules for consistency and better maintainability.

## ✅ Goals

- Keep component imports predictable and tree-shakeable.
- Make components easy to find and reason about.
- Strong convention: use only named exports in code modules; avoid default exports except where absolutely necessary (e.g., some config files or generated artifacts explained below).

---

## 📁 File & Folder Conventions

- File names should use **kebab-case**.
- Component names are **PascalCase** (as usual in React/Svelte/JS ecosystems).
- For simple components, use a single file directly under the correct components folder:
  - `src/components/react/button.tsx`
  - `src/components/astro/footer.astro`
- For complex components that need multiple files (subcomponents, styles, utils, tests, types), create a folder named after the component (kebab-case) with primary component file named the same as the folder (kebab-case):
  - `src/components/react/header/`
    - `header.tsx` — primary component
    - `header-link.tsx` — small shared subcomponent
    - `utils/some-util.ts` — helper functions or utilities
    - `header.test.tsx` — unit tests
    - `types.ts` — exported types
    - `index.ts` — specific to grouping: re-export named members (see `Exporting` section)

### Examples

- Simple React component
  - `src/components/react/button.tsx`

- Complex React component folder
  - `src/components/react/header/header.tsx`
  - `src/components/react/header/header-link.tsx`
  - `src/components/react/header/utils/some-util.ts`
  - `src/components/react/header/types.ts`
  - `src/components/react/header/index.ts` (re-exports)

- Astro components
  - `src/components/astro/footer.astro` (Astro components live under `src/components/astro`)

---

## 🔧 Exports — Named exports only

- Use **named exports** for all JS/TS modules. Avoid `export default`.
- Named export example for a React component:

```tsx
// src/components/react/button.tsx
import React from "react";

export type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};
```

- In the case of multiple entities per file you can export the utility functions and types as named exports too.

### Re-exports via index

- Use an `index.ts` file to group named exports:

```ts
// src/components/react/header/index.ts
export * from "./header";
export * from "./header-link";
export * from "./types";
```

- Importers should always consume named exports:

```tsx
import { Header } from "src/components/react/header";
```
