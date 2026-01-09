import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

/**
 * Helper type to merge an array of objects into one single type.
 * This provides the user with full autocomplete for ALL combined plugins.
 */
type MergePlugins<T extends Record<string, string>[]> = T extends [infer First, ...infer Rest]
    ? First & (Rest extends Record<string, string>[] ? MergePlugins<Rest> : {})
    : {};

/**
 * Creates a customized class utility instance with plugin support.
 * * This factory function merges multiple prefix plugins and returns a scoped
 * `cl` function that handles recursive prefixing, tailwind-merge, and clsx logic.
 * * @param plugins - One or more objects defining prefix maps (e.g., { btn: 'button' }).
 * @returns A specialized `cl` function with autocompletion for the provided plugins.
 * * @example
 * const myCl = createCl({ ui: 'prefix' });
 * // Autocomplete will suggest 'ui' or 'base'
 * myCl({ ui: { primary: true } }); // 'prefix:primary'
 */
export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    // Core merges all plugins into a single registry automatically
    const registry: Record<string, string> = Object.assign({ base: 'base' }, ...plugins);

    type CombinedKeys = keyof MergePlugins<TPlugins>;

    /**
     * Internal processor to handle recursive key chaining and prefix mapping.
     */
    const process = (key: string, value: any): string => {
        if (!value) return '';

        if (Array.isArray(value)) {
            return value
                .map((v) => process(key, v))
                .filter(Boolean)
                .join(' ');
        }

        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([nestedKey, nestedValue]) => {
                    // FIX: If the nested key is 'base', it doesn't add to the prefix chain
                    const combinedKey =
                        key === 'base'
                            ? nestedKey
                            : nestedKey === 'base'
                            ? key // If nested is base, keep the parent key
                            : `${key}:${nestedKey}`;

                    return process(combinedKey, nestedValue);
                })
                .join(' ');
        }

        const prefix = registry[key] || key;

        if (typeof value === 'string') {
            return value
                .split(/[,\s\n]+/)
                .filter(Boolean)
                .map((cls) => (prefix === 'base' ? cls : `${prefix}:${cls}`))
                .join(' ');
        }
        return '';
    };

    /**
     * Optimized class utility function.
     * * Combines multiple arguments into a single string, resolving Tailwind conflicts
     * and applying the plugin prefixing logic defined during creation.
     * * @param inputs - Arguments can be strings, objects with plugin keys, or standard ClassValues.
     * @returns A merged string of CSS classes.
     */
    return (...inputs: (ClassValue | { [K in CombinedKeys | 'base' | (string & {})]?: any })[]) => {
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
