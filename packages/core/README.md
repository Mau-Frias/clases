# 🚀 Class Utilities

A high-performance, recursive, and type-safe utility for managing CSS classes. Designed specifically for Tailwind CSS users who want to replace messy string concatenations with structured, maintainable objects.

## ✨ Features

- 🔄 **Deep Recursion:** Nest variants like `md: { hover: '...' }` to stack prefixes automatically.
- 🛡️ **Hard Typing:** Full IntelliSense autocomplete for all Tailwind variants and custom plugins.
- 🔌 **Stackable Plugins:** Merge multiple design systems or custom configurations into a single `cl` function.
- 🗜️ **Zero Overhead:** Built on top of `tailwind-merge` and `clsx` for optimal performance and conflict resolution.
- 📦 **Monorepo Ready:** Lightweight, tree-shakable packages.

---

## 📦 Packages

| Package | Description |
| :--- | :--- |
| **clases** | The recursive engine. Use this to build custom variants or plugins. |
| **clases-tailwind** | Pre-configured with all Tailwind CSS variants and type definitions. |

---

## 🚀 Quick Start

### 1. Installation

```bash
pnpm add clases-tailwind clases
```

### 2. Basic Usage

```typescript
import { cl } from 'clases-tailwind';

const className = cl({
  base: 'p-4 text-sm transition-all',
  hover: 'bg-blue-500 text-white',
  md: 'text-lg p-8',
  dark: {
    base: 'bg-gray-900',
    hover: 'bg-gray-800'
  }
});
```

---

## 💡 Advanced Use Cases

### 🔄 Recursive Stacking (The "Secret Sauce")
Stop repeating prefixes. Nesting objects automatically stacks variants in the correct order.

```typescript
cl({
  md: {
    hover: {
      base: 'scale-105',
      after: 'content-["*"]'
    }
  }
});
// Result: "md:hover:scale-105 md:hover:after:content-['*']"
```
---

## 🌈 Beautiful Syntax & Variants

The most powerful feature of this utility is **Transparent Logical Nesting**. It allows you to organize your design system using nested objects that represent your business logic (variants, states, or themes) without polluting the final CSS output.

#### How it Works

The engine distinguishes between **Registered Prefixes** (modifiers like `md`, `hover`, or `ui`) and **Logical Keys** (your own organizational names like `variants`, `primary`, or `[state]`):

* **Registered Keys**: Concatenate to form the final CSS prefix.
* **Unregistered Keys**: Act as transparent wrappers. They are ignored in the final string but pass the current prefix down to their children.

#### Component Variants Example

This structure allows you to colocate base styles, responsive modifiers, and interaction states within a single logical branch:

```typescript
const variant = 'primary';
const theme = 'dark';

const className = cl({
  md: {
    // 'variants' is NOT in the registry, so it is transparent
    variants: {
      // We select the active branch using standard JS
      [variant]: {
        base: 'rounded-lg px-4 py-2 transition',
        // 'dark' is a registered prefix, so it will be mapped
        dark: 'border-white text-white',
        hover: 'opacity-80'
      },
      secondary: 'bg-gray-200 text-black'
    }[variant]
  }
});

/**
 * Output (for variant 'primary'):
 * "md:rounded-lg md:px-4 md:py-2 md:transition md:dark:border-white md:dark:text-white md:hover:opacity-80"
 */
```

#### Why this is superior:

1. **Clean DOM**: You won't see "ghost" prefixes like `variants:primary:bg-blue-500` in your HTML.
2. **Zero Boilerplate**: You don't have to repeat `md:dark:...` for every single class; the engine handles the chain automatically.
3. **Type-Safe Organization**: Use your own naming conventions to group styles while keeping the output perfectly compatible with Tailwind CSS.

#### Best Practice: Selection Logic

To keep the output optimized and prevent class collisions, handle the selection at the logical level so the engine only processes the "winning" branch:

```typescript
cl({
  ui: {
    [status]: {
      success: 'text-green-600',
      error: 'text-red-600',
      pending: 'text-yellow-600'
    }[status]
  }
});
```
---

### 🛠️ Custom Plugin Management
You can stack the Tailwind plugin with your own semantic aliases or project-specific configs.

```typescript
import { createCl } from 'clases';
import { tailwind } from 'clases-tailwind';

const cl = createCl(
  tailwind, 
  { 
    hocus: 'hover:focus',
    brand: 'text-indigo-600 dark:text-indigo-400' 
  }
);

cl({ 
  hocus: 'outline-none ring-2',
  brand: 'font-bold' 
});
```

### 📂 Clean Multi-line Layouts
Use backticks and commas to organize large chunks of layout logic without losing readability.

```typescript
cl({
  base: `
    grid grid-cols-1,
    gap-4 items-center,
    w-full max-w-7xl mx-auto
  `,
  lg: 'grid-cols-3 gap-8'
});
```
---

## ⌨️ Why Objects?

| Feature | Standard Tailwind Strings | Class Utilities Objects |
| :--- | :--- | :--- |
| **Readability** | ❌ Hard to scan long lines | ✅ Grouped by variant |
| **Maintenance** | ❌ Easy to forget prefixes | ✅ Automatic stacking |
| **Logic** | ❌ Messy ternary operators | ✅ Native JS object logic |
| **Types** | ❌ String-based (no safety) | ✅ Full Autocomplete |

---

## 🛠️ API Reference

### `cl(...inputs)`
The main utility function. Accepts strings, arrays, objects, or nested structures.

### `createCl(...plugins)`
Factory function to create a customized `cl` instance. Merges all provided objects into a single type-safe registry.

### `tailwind`
The raw plugin data containing all Tailwind CSS variants.

---

## 📄 License
MIT © Mauricio Frías