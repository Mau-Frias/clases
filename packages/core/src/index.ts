import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    // Importante: No incluimos 'base' aquí para que no interfiera en el filtrado final
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
                    
                    let nextKey: string;
                    if (key === 'base') {
                        nextKey = nestedKey;
                    } else if (isRegistered) {
                        nextKey = `${key}:${nestedKey}`;
                    } else {
                        // Si no está registrado, mantenemos el key actual (transparencia)
                        nextKey = key;
                    }

                    return process(nextKey, nestedValue);
                })
                .join(' ');
        }

        // RESOLUCIÓN FINAL: Filtro estricto
        const resolvedPrefix = key
            .split(':')
            .map((part) => {
                if (part === 'base') return null;
                // SOLO devolvemos si existe en el registro. 
                // Si 'variants' no está, esto devuelve null y se limpia.
                return registry[part] || null; 
            })
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
                        // Si la llave inicial no está registrada, empezamos con 'base'
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
