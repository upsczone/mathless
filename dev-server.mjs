import { spawn } from 'node:child_process';
import path from 'node:path';

// Parse incoming arguments passed from npm or runner
const rawArgs = process.argv.slice(2);
const cleanedArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--host') {
    cleanedArgs.push('-H');
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      cleanedArgs.push(rawArgs[++i]);
    }
  } else if (arg.startsWith('--host=')) {
    cleanedArgs.push('-H', arg.slice('--host='.length));
  } else {
    cleanedArgs.push(arg);
  }
}

// Ensure port 3000 is default if not explicitly provided
if (!cleanedArgs.includes('-p') && !cleanedArgs.includes('--port')) {
  cleanedArgs.unshift('-p', '3000');
}

// Ensure hostname 0.0.0.0 is default if not explicitly provided
if (!cleanedArgs.includes('-H') && !cleanedArgs.includes('--hostname')) {
  cleanedArgs.unshift('-H', '0.0.0.0');
}

const nextBin = path.resolve('node_modules/next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'dev', ...cleanedArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3000',
  },
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
