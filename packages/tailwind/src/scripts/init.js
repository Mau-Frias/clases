const fs = require('fs');
const path = require('path');

const projectRoot = process.env.INIT_CWD || path.resolve('../../');
const hasSrc = fs.existsSync(path.join(projectRoot, 'src'));
const targetDir = hasSrc ? path.join(projectRoot, 'src') : projectRoot;
const configPath = path.join(targetDir, 'clases.config.ts');

const tailwindTemplate = `import { createCl } from 'clases';
import { tailwindRegistry } from 'clases-tailwind';

// Instancia configurada para Tailwind CSS
export const tw = createCl(tailwindRegistry);
`;

try {
    // En este caso, SIEMPRE queremos que si instalan clases-tailwind,
    // el archivo tenga la configuración de Tailwind.
    fs.writeFileSync(configPath, tailwindTemplate, 'utf8');
    console.log(
        '\x1b[32m%s\x1b[0m',
        '  [clases-tailwind] Configuración vinculada con éxito en ' + (hasSrc ? 'src/' : './')
    );
} catch (err) {
    console.log('  [clases-tailwind] Aviso: No se pudo auto-configurar el archivo.');
}
