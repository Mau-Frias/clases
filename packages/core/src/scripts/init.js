#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Intentamos INIT_CWD (npm/pnpm), si no, el directorio actual
const projectRoot = process.env.INIT_CWD || process.cwd();
const hasSrc = fs.existsSync(path.join(projectRoot, 'src'));
const targetDir = hasSrc ? path.join(projectRoot, 'src') : projectRoot;
const configPath = path.join(targetDir, 'clases.config.ts');

const template = `import { createCl } from 'clases';

export const cl = createCl({});
`;

function init() {
    if (fs.existsSync(configPath)) {
        // Si el usuario lo corre manualmente con npx, avisamos.
        // Si es postinstall, mejor callar.
        if (!process.env.INIT_CWD) {
            console.log('⚠️ El archivo clases.config.ts ya existe.');
        }
        return;
    }

    try {
        fs.writeFileSync(configPath, template, 'utf8');
        console.log('\x1b[32m%s\x1b[0m', '✅ clases.config.ts generado con éxito.');
    } catch (e) {
        console.error('❌ Error al crear la configuración:', e.message);
    }
}

init();
