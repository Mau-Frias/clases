import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export function createCl<TPlugins extends Record<string, string>[]>(...plugins: TPlugins) {
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    const process = (accumulatedPrefix: string, input: any): string => {
        if (!input) return '';

        // 1. Strings: Aplicar prefijo acumulado
        if (typeof input === 'string') {
            return input
                .split(/[,\s\n]+/)
                .filter(Boolean)
                .map((cls) => (accumulatedPrefix ? `${accumulatedPrefix}:${cls}` : cls))
                .join(' ');
        }

        // 2. Arrays: Procesar cada elemento
        if (Array.isArray(input)) {
            return input
                .map((i) => process(accumulatedPrefix, i))
                .filter(Boolean)
                .join(' ');
        }

        // 3. Objetos: El corazón del problema
        if (typeof input === 'object') {
            let results: string[] = [];

            for (const [key, value] of Object.entries(input)) {
                if (!value) continue;

                const registeredPrefix = registry[key];

                if (registeredPrefix) {
                    // Es un prefijo: acumulamos y bajamos un nivel
                    const nextPrefix = accumulatedPrefix
                        ? `${accumulatedPrefix}:${registeredPrefix}`
                        : registeredPrefix;
                    results.push(process(nextPrefix, value));
                } else {
                    // NO es prefijo: es lógica { 'clase': true }
                    // Procesamos la llave 'key' como el contenido, bajo el prefijo actual
                    results.push(process(accumulatedPrefix, key));
                }
            }
            return results.join(' ');
        }

        return '';
    };

    return (...inputs: ClassValue[]) => {
        // Ejecutamos nuestro motor en cada input
        const processed = inputs.map((input) => process('', input));
        // twMerge se encarga de limpiar el string final
        return twMerge(processed.filter(Boolean).join(' '));
    };
}
