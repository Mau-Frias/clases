import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    const process = (key: string, value: any): string => {
        if (!value) return '';

        // 1. Arrays: Multilínea
        if (Array.isArray(value)) {
            return value
                .map((v) => process(key, v))
                .filter(Boolean)
                .join(' ');
        }

        // 2. Objetos
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([nestedKey, nestedValue]) => {
                    const isPrefix = registry[nestedKey] !== undefined;

                    if (isPrefix) {
                        const nextKey = key ? `${key}:${nestedKey}` : nestedKey;
                        return process(nextKey, nestedValue);
                    }

                    // CORRECCIÓN: Si es lógica { 'clase': true },
                    // procesamos la LLAVE como el valor para que reciba el prefijo
                    if (nestedValue) {
                        return process(key, nestedKey);
                    }

                    return '';
                })
                .join(' ');
        }

        // 3. Resolución de Prefijo
        const resolvedPrefix = key
            .split(':')
            .map((part) => registry[part] || null)
            .filter(Boolean)
            .join(':');

        // 4. Aplicación (Ahora sí recibirá la clase desde el paso 2)
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
        const processed = inputs.map((input) => process('', input));
        return twMerge(clsx(processed));
    };
}
