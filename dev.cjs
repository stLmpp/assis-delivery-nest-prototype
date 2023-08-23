const { spawn } = require('node:child_process');

const watchProgram = spawn('npm run build:watch', {
  shell: true,
  stdio: 'ignore'
});
const emulatorProgram = spawn('firebase emulators:start', {
  shell: true,
  stdio: 'inherit'
});
