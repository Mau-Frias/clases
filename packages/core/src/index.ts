import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

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
                    const isRegistered = registry[nestedKey] !== undefined;
                    // Si el hijo está registrado, añadimos al prefijo.
                    // Si no, mantenemos el prefijo actual (transparencia).
                    const nextKey = isRegistered ? (key ? `${key}:${nestedKey}` : nestedKey) : key;

                    return process(nextKey, nestedValue);
                })
                .join(' ');
        }

        // RESOLUCIÓN: Solo lo que esté en el registro se convierte en prefijo.
        const resolvedPrefix = key
            .split(':')
            .map((part) => registry[part] || null)
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
                        // Si la llave raíz no está registrada, empezamos proceso con key vacía
                        return process(registry[k] ? k : '', v);
                    })
                    .join(' ');
            }
            return input;
        });
        return twMerge(clsx(processed));
    };
}
