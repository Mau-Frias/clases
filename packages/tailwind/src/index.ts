


/**
 * Configuration object containing default prefixes for Tailwind CSS.
 * * Use this to maintain consistency between your class utility and 
 * Tailwind's variant system.
 * @example
 * // Accessing a specific prefix
 * const basePrefix = tailwindPlugin.prefix;
 */
export const tailwindPlugin = {
    // --- Estructura y Pantallas ---
    base: 'base',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',

    // --- Estados de Usuario (Interacción) ---
    hover: 'hover',
    focus: 'focus',
    active: 'active',
    visited: 'visited',
    target: 'target',
    'focus-within': 'focus-within',
    'focus-visible': 'focus-visible',

    // --- Estados de Formulario ---
    disabled: 'disabled',
    enabled: 'enabled',
    checked: 'checked',
    indeterminate: 'indeterminate',
    default: 'default',
    required: 'required',
    valid: 'valid',
    invalid: 'invalid',
    'in-range': 'in-range',
    'out-of-range': 'out-of-range',
    'placeholder-shown': 'placeholder-shown',
    autofill: 'autofill',
    'read-only': 'read-only',

    // --- Posicionamiento y Árbol (Pseudo-clases) ---
    first: 'first',
    last: 'last',
    only: 'only',
    odd: 'odd',
    even: 'even',
    'first-of-type': 'first-of-type',
    'last-of-type': 'last-of-type',
    'only-of-type': 'only-of-type',
    empty: 'empty',

    // --- Relaciones de Elementos (Group & Peer) ---
    group: 'group-hover', // Alias amigable
    'group-hover': 'group-hover',
    'group-focus': 'group-focus',
    'group-active': 'group-active',
    'group-visited': 'group-visited',
    'group-invalid': 'group-invalid',
    peer: 'peer-hover', // Alias amigable
    'peer-hover': 'peer-hover',
    'peer-focus': 'peer-focus',
    'peer-active': 'peer-active',
    'peer-invalid': 'peer-invalid',

    // --- Media Queries (Preferencias de Sistema) ---
    dark: 'dark',
    light: 'light',
    'motion-reduce': 'motion-reduce',
    'motion-safe': 'motion-safe',
    'contrast-more': 'contrast-more',
    'contrast-less': 'contrast-less',
    portrait: 'portrait',
    landscape: 'landscape',

    // --- Pseudo-elementos ---
    marker: 'marker',
    selection: 'selection',
    'first-line': 'first-line',
    'first-letter': 'first-letter',
    backdrop: 'backdrop',
    placeholder: 'placeholder',
    before: 'before',
    after: 'after',
    file: 'file',

    // --- Varios y Print ---
    print: 'print',
    rtl: 'rtl',
    ltr: 'ltr'
};

// Export the type so users can use it in their component props
export type TailwindKey = keyof typeof tailwindPlugin;
