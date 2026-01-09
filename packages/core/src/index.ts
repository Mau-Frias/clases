import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    const process = (key: string, value: any): string => {
        if (!value) return '';

        if (Array.isArray(value)) {
            return value.map((v) => process(key, v)).filter(Boolean).join(' ');
        }

        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([nestedKey, nestedValue]) => {
                    const isRegistered = registry[nestedKey] !== undefined;
                    
                    // Si el padre es 'base', el hijo toma su lugar.
                    // Si el hijo está registrado, se concatena.
                    // Si no, heredamos el padre para mantener la transparencia.
                    const nextKey = key === 'base' 
                        ? nestedKey 
                        : (isRegistered ? `${key}:${nestedKey}` : key);

                    return process(nextKey, nestedValue);
                })
                .join(' ');
        }

        // RESOLUCIÓN: Solo permitimos partes que existan en el registry
        const resolvedPrefix = key
            .split(':')
            .map((part) => (part === 'base' ? null : (registry[part] || null)))
            .filter(Boolean)
            .join(':');

        if (typeof value === 'string') {
            return value
                .split(/[,\s\n]+/)
                .filter(Boolean)
                .map((cls) => (!resolvedPrefix ? cls : `${resolvedPrefix}:${cls}`))
                .join(' ');
        }
        return '';
    };

    return (...inputs: any[]) => {
        const processed = inputs.map((input) => {
            if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
                return Object.entries(input)
                    .map(([k, v]) => {
                        if (v === true) return k;
                        // SI LA LLAVE NO ESTÁ REGISTRADA (ej: 'variants'), 
                        // entramos como 'base' para que sea invisible.
                        const isRegistered = registry[k] !== undefined;
                        return process(isRegistered ? k : 'base', v);
                    })
                    .join(' ');
            }
            return input;
        });
        return twMerge(clsx(processed));
    };
}
