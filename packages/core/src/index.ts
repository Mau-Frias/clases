import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    const process = (key: string, value: any): string => {
        if (!value) return '';

        // 1. Soporte Multilínea (Arrays)
        if (Array.isArray(value)) {
            return value
                .map((v) => process(key, v))
                .filter(Boolean)
                .join(' ');
        }

        // 2. Objetos de Prefijos
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([nestedKey, nestedValue]) => {
                    const isPrefix = registry[nestedKey] !== undefined;

                    if (isPrefix) {
                        const nextKey = key ? `${key}:${nestedKey}` : nestedKey;
                        return process(nextKey, nestedValue);
                    }

                    // Lógica estándar: si no es prefijo, es una clase condicional
                    return nestedValue ? process(key, nestedKey) : '';
                })
                .join(' ');
        }

        // 3. Resolución y Aplicación
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

    return (...inputs: ClassValue[]) => {
        // Procesamos uno a uno para capturar objetos de prefijos antes de que clsx los aplane
        const processed = inputs.map((input) => process('', input));
        return twMerge(clsx(processed));
    };
}
