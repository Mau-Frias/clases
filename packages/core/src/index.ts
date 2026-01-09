import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

// Tipos para las opciones de configuración
export interface ClOptions<B extends string, C extends string> {
    baseKey?: B;
    conditionKey?: C;
    prefix?: string;
}

export function createCl<
    TPlugins extends Record<string, string>[],
    B extends string = 'base',
    C extends string = '?'
>(plugins: TPlugins, options: ClOptions<B, C> = {}) {
    // Unificamos los plugins en un solo registro
    const registry: Record<string, string> = Object.assign({}, ...plugins);

    // Extraemos opciones con valores por defecto
    const { baseKey = 'base' as B, conditionKey = 'if' as C, prefix: globalPrefix = '' } = options;

    /**
     * Aplica el prefijo global de configuración (ej: 'tw-') a una clase
     */
    const applyGlobalPrefix = (cls: string) => {
        if (!globalPrefix) return cls;
        // Evitamos prefijar si la clase ya tiene el prefijo o es vacía
        return cls
            .split(':')
            .map((part) => {
                // Solo prefijamos la clase final, no los modificadores (hover, md, etc)
                // pero como tailwind-merge y clsx se encargan de la limpieza,
                // aplicamos una lógica simple:
                return part;
            })
            .join(':');
        // Nota: El prefijo global de Tailwind suele aplicarse a la clase base: 'tw-bg-red'
    };

    const process = (accumulatedPath: string, input: any): string => {
        if (!input) return '';

        // 1. Caso String: Aquí es donde se resuelve el path acumulado
        if (typeof input === 'string') {
            const resolvedPrefix = accumulatedPath
                .split(':')
                .map((part) => {
                    // Si la parte del path es una de las llaves especiales, no genera prefijo CSS
                    if (part === baseKey || part === conditionKey) return null;
                    // Retornamos el valor del registro (ej: 'hover') o la parte tal cual
                    return registry[part] || part;
                })
                .filter(Boolean)
                .join(':');

            return input
                .split(/[,\s\n]+/)
                .filter(Boolean)
                .map((cls) => {
                    // Aplicamos el prefijo global a la clase
                    const finalClass = globalPrefix ? `${globalPrefix}${cls}` : cls;
                    // Aplicamos el prefijo acumulado (hover, md, etc)
                    return resolvedPrefix ? `${resolvedPrefix}:${finalClass}` : finalClass;
                })
                .join(' ');
        }

        // 2. Caso Array
        if (Array.isArray(input)) {
            return input
                .map((i) => process(accumulatedPath, i))
                .filter(Boolean)
                .join(' ');
        }

        // 3. Caso Objeto
        if (typeof input === 'object') {
            return Object.entries(input)
                .map(([key, value]) => {
                    if (!value) return '';

                    const isTransparent = key === baseKey || key === conditionKey;
                    const isRegistered = registry[key] !== undefined;

                    if (isTransparent || isRegistered) {
                        // Si es una llave especial o registrada, profundizamos en el path
                        const newPath = accumulatedPath ? `${accumulatedPath}:${key}` : key;
                        return process(newPath, value);
                    } else {
                        // Si la llave no está registrada, se trata como una clase bajo el path actual
                        // (Aquí value actúa como condición booleana para la llave)
                        return value ? process(accumulatedPath, key) : '';
                    }
                })
                .filter(Boolean)
                .join(' ');
        }

        return '';
    };

    return (...inputs: ClassValue[]) => {
        const processed = inputs.map((input) => process('', input));
        // twMerge se encarga de que 'bg-red-500 bg-blue-500' resulte en 'bg-blue-500'
        return twMerge(clsx(processed));
    };
}
