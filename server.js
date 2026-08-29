// ==============================================================================
// Hostinger & Node.js Universal Entry Point (server.js)
// Sistema de Gestão Territorial de Militância - São José / SC
// ==============================================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidatePaths = [
  path.resolve(__dirname, 'dist', 'server.cjs'),
  path.resolve(process.cwd(), 'dist', 'server.cjs')
];

const distServer = candidatePaths.find(p => fs.existsSync(p));

if (distServer) {
  console.log(`[Hostinger Boot] Iniciando servidor de produção compilado (${distServer})...`);
  await import(`file://${distServer}`);
} else {
  console.log('[Hostinger Boot] dist/server.cjs não encontrado. Iniciando tsx server.ts...');
  const { spawn } = await import('child_process');
  const child = spawn('npx', ['tsx', 'server.ts'], { stdio: 'inherit', shell: true });
  child.on('exit', (code) => process.exit(code || 0));
}
