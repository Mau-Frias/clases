import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    // Función auxiliar para obtener el prefijo real de Tailwind
    const getPrefix = (key: string) => {
        return key
            .split(':')
            .map((part) => registry[part])
            .filter(Boolean)
            .join(':');
    };

    const process = (accumulatedKey: string, value: any): string => {
        if (!value) return '';

        // 1. Arrays: Multilínea
        if (Array.isArray(value)) {
            return value
                .map((v) => process(accumulatedKey, v))
                .filter(Boolean)
                .join(' ');
        }

        // 2. Objetos
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([k, v]) => {
                    if (!v) return '';

                    // Si la llave es un prefijo (md, hover), profundizamos
                    if (registry[k] !== undefined) {
                        const nextKey = accumulatedKey ? `${accumulatedKey}:${k}` : k;
                        return process(nextKey, v);
                    }

                    // Si NO es prefijo, tratamos la llave 'k' como la clase final
                    // Pero le aplicamos el prefijo acumulado hasta ahora
                    return applyPrefix(accumulatedKey, k);
                })
                .join(' ');
        }

        // 3. Strings directos: Aplicamos el prefijo acumulado a cada palabra
        if (typeof value === 'string') {
            return applyPrefix(accumulatedKey, value);
        }

        return '';
    };

    // Función para aplicar el prefijo resuelto a un string de clases
    const applyPrefix = (key: string, classString: string): string => {
        const resolved = getPrefix(key);
        if (!resolved) return classString;

        return classString
            .split(/[,\s\n]+/)
            .filter(Boolean)
            .map((cls) => `${resolved}:${cls}`)
            .join(' ');
    };

    return (...inputs: ClassValue[]) => {
        const processed = inputs.map((input) => process('', input));
        return twMerge(clsx(processed));
    };
}
