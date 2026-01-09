import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

/**
 * Creates a customized Tailwind class engine instance with prefix registry support.
 * * @param plugins - Objects mapping custom aliases (e.g., 'ui') to real Tailwind prefixes (e.g., 'prefix').
 * @returns A recursive 'cl' function that processes strings, arrays, and objects.
 * * @example
 * const tw = createCl({ md: 'md', ui: 'prefix' });
 */
export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    /**
     * Recursively processes input values to apply prefixes and logic.
     * * @param accumulatedPrefix - The prefix path built during recursion (e.g., 'md:hover').
     * @param input - The value to process (string, array, or object).
     * @returns A string of prefixed and filtered Tailwind classes.
     */
    const process = (accumulatedPrefix: string, input: any): string => {
        if (!input) return '';

        // 1. Strings: Resolve real Tailwind prefixes and apply them
        if (typeof input === 'string') {
            const resolved = accumulatedPrefix
                .split(':')
                .map((part) => (part === 'base' ? null : registry[part] || null))
                .filter(Boolean)
                .join(':');

            return input
                .split(/[,\s\n]+/) // Split by commas, spaces, or newlines
                .filter(Boolean)
                .map((cls) => (resolved ? `${resolved}:${cls}` : cls))
                .join(' ');
        }

        // 2. Arrays: Multi-line support and recursive processing
        if (Array.isArray(input)) {
            return input
                .map((i) => process(accumulatedPrefix, i))
                .filter(Boolean)
                .join(' ');
        }

        // 3. Objects: Prefix navigation and Conditional Logic (clsx-style)
        if (typeof input === 'object') {
            return Object.entries(input)
                .map(([key, value]) => {
                    if (!value) return '';

                    const isBase = key === 'base';
                    const isPrefix = registry[key] !== undefined;

                    if (isBase || isPrefix) {
                        // It's an organization node or a prefix: accumulate and dive deeper
                        const nextPrefix = accumulatedPrefix ? `${accumulatedPrefix}:${key}` : key;
                        return process(nextPrefix, value);
                    } else {
                        // Standard logic { 'class-name': boolean }: treat the key as the class content
                        return process(accumulatedPrefix, key);
                    }
                })
                .filter(Boolean)
                .join(' ');
        }

        return '';
    };

    /**
     * Main utility for generating Tailwind classes.
     * Supports strings, nested objects with prefixes, and arrays.
     * * @param inputs - A list of arguments following the clsx pattern.
     * @returns A processed, deduplicated string of classes via twMerge.
     * * @example
     * tw('btn-base', { md: 'p-4', hover: { 'opacity-50': isDim } });
     */
    return (...inputs: ClassValue[]) => {
        const processed = inputs.map((input) => process('', input));
        return twMerge(clsx(processed));
    };
}
