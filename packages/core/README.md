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