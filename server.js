// ==============================================================================
// Hostinger & Node.js Universal Entry Point (server.js)
// Sistema de Gestão Territorial de Militância - São José / SC
// ==============================================================================
import fs from 'fs';
import path from 'path';

const distServer = path.resolve(process.cwd(), 'dist/server.cjs');

if (fs.existsSync(distServer)) {
  console.log('[Hostinger Boot] Iniciando servidor de produção compilado (dist/server.cjs)...');
  await import(`file://${distServer}`);
} else {
  console.log('[Hostinger Boot] dist/server.cjs não encontrado. Executando fallback via tsx...');
  const { spawn } = await import('child_process');
  const child = spawn('npx', ['tsx', 'server.ts'], { stdio: 'inherit', shell: true });
  child.on('exit', (code) => process.exit(code || 0));
}
