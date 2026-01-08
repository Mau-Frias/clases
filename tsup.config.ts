import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm','cjs'], // Modern JS only for better Astro/Next.js support
    dts: true, // Generates the .d.ts files for IntelliSense
    splitting: false,
    sourcemap: true,
    clean: true, // Cleans the /dist folder before each build
    treeshake: true
});
