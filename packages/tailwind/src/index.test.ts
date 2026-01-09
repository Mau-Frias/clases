import { describe, it, expect } from 'vitest';
import { cl } from './index';

describe('cl utility (Tailwind version)', () => {
    it('debe procesar clases base (sin prefijo)', () => {
        const result = cl({ base: 'p-4 bg-red-500' });
        expect(result).toBe('p-4 bg-red-500');
    });

    it('debe aplicar prefijos simples de Tailwind', () => {
        const result = cl({
            base: 'text-black',
            md: 'text-lg',
            hover: 'text-blue-500'
        });
        expect(result).toContain('text-black');
        expect(result).toContain('md:text-lg');
        expect(result).toContain('hover:text-blue-500');
    });

    it('debe manejar arrays de clases en los prefijos', () => {
        const result = cl({
            base: ['p-4', 'm-2'],
            lg: ['flex', 'items-center']
        });
        expect(result).toBe('p-4 m-2 lg:flex lg:items-center');
    });

    it('debe limpiar clases conflictivas usando tailwind-merge', () => {
        // Aquí p-4 y p-8 chocan, debería ganar p-8
        const result = cl('p-4', { base: 'p-8' });
        expect(result).toBe('p-8');
    });

    it('debe ignorar valores falsy (condicionales)', () => {
        const isError = false;
        const result = cl({
            base: 'p-4',
            md: isError && 'bg-red-500'
        });
        expect(result).toBe('p-4');
    });

    it('debe funcionar con prefijos custom no definidos (fallback)', () => {
        const result = cl({
            'data-active': 'opacity-100'
        });
        expect(result).toBe('data-active:opacity-100');
    });

    it('debe manejar el alias especial "group"', () => {
        const result = cl({
            group: 'opacity-50'
        });
        expect(result).toBe('group-hover:opacity-50');
    });
});
