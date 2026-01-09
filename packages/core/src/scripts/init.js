const fs = require('fs');
const path = require('path');

// Intentamos encontrar el root del proyecto del usuario
const projectRoot = process.env.INIT_CWD || path.resolve('../../');
// Buscamos si existe la carpeta 'src' para ponerlo ahí (mejor para Tailwind/Vite)
const hasSrc = fs.existsSync(path.join(projectRoot, 'src'));
const targetDir = hasSrc ? path.join(projectRoot, 'src') : projectRoot;
const configPath = path.join(targetDir, 'clases.config.ts');

const template = `import { createCl } from 'clases';

// Instancia base agnóstica
export const cl = createCl({});
`;

try {
    // Solo lo creamos si no existe para no borrar trabajo del usuario
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, template, 'utf8');
        console.log(
            '\x1b[36m%s\x1b[0m',
            '  [clases] Configuración base creada en ' + (hasSrc ? 'src/' : './')
        );
    }
} catch (err) {
    // Fallo silencioso para no romper la instalación si hay problemas de permisos
}
