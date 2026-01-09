import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    const process = (accumulatedPath: string, input: any): string => {
        console.log(`[START] Path: "${accumulatedPath}" | Input:`, input);

        if (!input) {
            console.log(`[SKIP] Input is falsy`);
            return '';
        }

        // 1. Caso String
        if (typeof input === 'string') {
            const resolvedPrefix = accumulatedPath
                .split(':')
                .map((part) => {
                    if (part === 'base' || part === '?') return null;
                    return registry[part] || part;
                })
                .filter(Boolean)
                .join(':');

            const result = input
                .split(/[,\s\n]+/)
                .filter(Boolean)
                .map((cls) => (resolvedPrefix ? `${resolvedPrefix}:${cls}` : cls))
                .join(' ');

            console.log(`[STRING] Resolved: "${resolvedPrefix}" | Out: "${result}"`);
            return result;
        }

        // 2. Caso Array
        if (Array.isArray(input)) {
            console.log(`[ARRAY] Processing ${input.length} elements...`);
            return input
                .map((i) => process(accumulatedPath, i))
                .filter(Boolean)
                .join(' ');
        }

        // 3. Caso Objeto
        if (typeof input === 'object') {
            console.log(`[OBJECT] Keys:`, Object.keys(input));
            return Object.entries(input)
                .map(([key, value]) => {
                    const isTransparent = key === 'base' || key === '?';
                    const isRegistered = registry[key] !== undefined;

                    console.log(
                        `  -> Key: "${key}" | Value: ${value} | isPrefix: ${isRegistered} | isTransparent: ${isTransparent}`
                    );

                    if (!value) {
                        console.log(`  [SKIP KEY] "${key}" because value is falsy`);
                        return '';
                    }

                    if (isTransparent || isRegistered) {
                        const newPath = accumulatedPath ? `${accumulatedPath}:${key}` : key;
                        console.log(`  [DIVE] Moving to path: "${newPath}"`);
                        return process(newPath, value);
                    } else {
                        console.log(
                            `  [CLASS] Treating key "${key}" as class under path "${accumulatedPath}"`
                        );
                        return process(accumulatedPath, key);
                    }
                })
                .filter(Boolean)
                .join(' ');
        }

        return '';
    };

    return (...inputs: ClassValue[]) => {
        const processed = inputs.map((input) => process('', input));
        return twMerge(clsx(processed));
    };
}
