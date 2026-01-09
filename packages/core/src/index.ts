import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

/**
 * Options to customize the engine behavior.
 */
export interface ClOptions<B extends string, C extends string> {
    /** The key used for static base classes. Defaults to 'base'. */
    baseKey?: B;
    /** The key used for conditional class objects. Defaults to 'if' or '?'. */
    conditionKey?: C;
    /** A global prefix to be applied to every utility class (e.g., 'tw-'). */
    prefix?: string;
}

/**
 * Creates a customized class utility function with plugin support.
 * * @param plugins - An array of registry objects mapping keys to CSS prefixes.
 * @param options - Configuration for reserved keys and global prefixing.
 * @returns A function that processes nested class objects and merges them using tailwind-merge.
 */
export function createCl<
    TPlugins extends Record<string, string>[],
    B extends string = 'base',
    C extends string = '?'
>(plugins: TPlugins, options: ClOptions<B, C> = {}) {
    /** Unified registry from all provided plugins */
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    /** Extracted options with sensible defaults */
    const { baseKey = 'base' as B, conditionKey = '?' as C, prefix: globalPrefix = '' } = options;

    /**
     * Internal helper to apply the global prefix to a specific class.
     * @param cls - The raw class name string.
     */
    const applyGlobalPrefix = (cls: string): string => {
        if (!globalPrefix) return cls;
        // The global prefix is applied to the utility class itself,
        // while variant modifiers (hover:, md:) remain handled by the path resolver.
        return `${globalPrefix}${cls}`;
    };

    /**
     * Recursive processor that traverses the input structure to resolve paths and conditions.
     * @param accumulatedPath - The current breadcrumb of prefixes (e.g., "md:hover").
     * @param input - The current input level (string, array, or object).
     */
    const process = (accumulatedPath: string, input: any): string => {
        if (!input) return '';

        // 1. String Case: Resolve accumulated path and apply to each class
        if (typeof input === 'string') {
            const resolvedPrefix = accumulatedPath
                .split(':')
                .map((part) => {
                    // Skip reserved keys in the final CSS output
                    if (part === baseKey || part === conditionKey) return null;
                    // Return the registered modifier or the part itself
                    return registry[part] || part;
                })
                .filter(Boolean)
                .join(':');

            return input
                .split(/[,\s\n]+/)
                .filter(Boolean)
                .map((cls) => {
                    const finalClass = applyGlobalPrefix(cls);
                    return resolvedPrefix ? `${resolvedPrefix}:${finalClass}` : finalClass;
                })
                .join(' ');
        }

        // 2. Array Case: Process each element recursively
        if (Array.isArray(input)) {
            return input
                .map((i) => process(accumulatedPath, i))
                .filter(Boolean)
                .join(' ');
        }

        // 3. Object Case: Handle reserved keys, registered prefixes, or conditional classes
        if (typeof input === 'object') {
            return Object.entries(input)
                .map(([key, value]) => {
                    if (!value) return '';

                    const isTransparent = key === baseKey || key === conditionKey;
                    const isRegistered = registry[key] !== undefined;

                    if (isTransparent || isRegistered) {
                        // If it's a reserved key or found in registry, dive deeper into the path
                        const newPath = accumulatedPath ? `${accumulatedPath}:${key}` : key;
                        return process(newPath, value);
                    } else {
                        // If the key is not in registry, treat the key as a class and value as a condition
                        return value ? process(accumulatedPath, key) : '';
                    }
                })
                .filter(Boolean)
                .join(' ');
        }

        return '';
    };

    /**
     * The final utility function (e.g., 'tw' or 'cl').
     * Processes inputs and runs them through clsx and tailwind-merge.
     */
    return (...inputs: ClassValue[]): string => {
        const processed = inputs.map((input) => process('', input));
        return twMerge(clsx(processed));
    };
}
