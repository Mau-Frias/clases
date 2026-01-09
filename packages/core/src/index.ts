import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

/**
 * Motor de prefijos con soporte para plugins, lógica transparente y limpieza via twMerge.
 */
export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    const process = (key: string, value: any): string => {
        if (!value) return '';

        // 1. Manejo de Arrays
        if (Array.isArray(value)) {
            return value
                .map((v) => process(key, v))
                .filter(Boolean)
                .join(' ');
        }

        // 2. Manejo de Objetos (Nesting y Lógica)
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([nestedKey, nestedValue]) => {
                    const isRegistered = registry[nestedKey] !== undefined;

                    let nextKey: string;
                    if (key === '' || key === 'base') {
                        // Si no hay prefijo previo, el hijo inicia la cadena
                        nextKey = nestedKey;
                    } else if (isRegistered) {
                        // Si el hijo es un prefijo registrado, se concatena (ej: md:hover)
                        nextKey = `${key}:${nestedKey}`;
                    } else {
                        // Si el hijo es lógica transparente (ej: variants), heredamos el prefijo padre
                        nextKey = key;
                    }

                    return process(nextKey, nestedValue);
                })
                .join(' ');
        }

        // 3. Resolución Final de Prefijos
        const resolvedPrefix = key
            .split(':')
            .map((part) => {
                if (part === 'base') return null; // 'base' nunca se imprime
                return registry[part] || null; // Solo lo registrado sobrevive
            })
            .filter(Boolean)
            .join(':');

        // 4. Aplicación de Clases
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
     * Función resultante (tw)
     */
    return (...inputs: ClassValue[]) => {
        const processed = inputs.map((input) => {
            if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
                return Object.entries(input)
                    .map(([k, v]) => {
                        // Soporte para booleanos nativos de clsx: { 'clase': true }
                        if (v === true) return k;

                        // Si la llave es un prefijo registrado (md, hover, ui), empezamos proceso
                        if (registry[k] || k === 'base') return process(k, v);

                        // Si no es prefijo (ej: variantes dinámicas), procesamos el interior como base
                        return process('base', v);
                    })
                    .join(' ');
            }
            return input;
        });

        // Resolvemos con clsx y limpiamos conflictos con twMerge
        return twMerge(clsx(processed));
    };
}
