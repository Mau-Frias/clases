import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

/**
 * Creates a specialized utility for managing CSS classes with prefix support,
 * plugin mapping, and transparent logical nesting.
 * * @param plugins - An array of objects mapping custom aliases to real CSS prefixes.
 * @returns A function that processes class values, objects, and nested structures.
 */
export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    /**
     * Internal registry that stores all official prefixes.
     * Any key not found here will be treated as "transparent" logic.
     */
    const registry: Record<string, string> = Object.assign({ base: 'base' }, ...plugins);

    /**
     * Recursively processes keys and values to build the prefixed class string.
     * * @param key - The current accumulated prefix path.
     * @param value - The class value, array, or nested object to process.
     * @returns A space-separated string of prefixed classes.
     */
    const process = (key: string, value: any): string => {
        if (!value) return '';

        // Handle Arrays: Process each element with the current key
        if (Array.isArray(value)) {
            return value
                .map((v) => process(key, v))
                .filter(Boolean)
                .join(' ');
        }

        // Handle Objects: Manage nesting and logical transparency
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([nestedKey, nestedValue]) => {
                    /**
                     * Rule: If the child key is registered, we concatenate it.
                     * If it's not registered, it's a "logical" key (transparent),
                     * so we inherit the parent's prefix.
                     */
                    const isRegistered = registry[nestedKey] !== undefined;
                    const nextKey =
                        key === 'base' ? nestedKey : isRegistered ? `${key}:${nestedKey}` : key;

                    return process(nextKey, nestedValue);
                })
                .join(' ');
        }

        /**
         * FINAL RESOLUTION
         * Maps aliases (e.g., 'ui') to real prefixes (e.g., 'prefix')
         * and removes any non-registered logical parts.
         */
        const resolvedPrefix = key
            .split(':')
            .map((part) => {
                if (part === 'base') return null;
                // Return mapped value from registry if it exists
                if (registry[part]) return registry[part];
                // Otherwise, discard the part (Total Transparency)
                return null;
            })
            .filter(Boolean)
            .join(':');

        // Apply the resolved prefix to each class in the string
        if (typeof value === 'string') {
            return value
                .split(/[,\s\n]+/)
                .filter(Boolean)
                .map((cls) => (!resolvedPrefix ? cls : `${resolvedPrefix}:${cls}`))
                .join(' ');
        }
        return '';
    };

    /**
     * The final utility function.
     * Processes inputs through the prefix engine and cleans them using tailwind-merge.
     * * @param inputs - Variadic arguments including strings, objects, arrays, or booleans.
     * @returns A merged and optimized string of Tailwind CSS classes.
     */
    return (...inputs: any[]) => {
        const processed = inputs.map((input) => {
            if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
                return Object.entries(input)
                    .map(([k, v]) => (v === true ? k : process(k, v)))
                    .join(' ');
            }
            return input;
        });
        return twMerge(clsx(processed));
    };
}
