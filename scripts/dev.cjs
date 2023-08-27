const { spawn } = require('node:child_process');
const firebaseJson = require('../firebase.json');
const killPort = require('kill-port');
const { noop } = require('rxjs');
const { SWC_DEFAULT } = require('./constants.cjs');
const { writeFile } = require('node:fs/promises');

async function killFirebasePorts() {
  await Promise.all([
    killPort(firebaseJson.emulators.auth.port).catch(noop),
    killPort(firebaseJson.emulators.firestore.port).catch(noop),
    killPort(firebaseJson.emulators.functions.port).catch(noop),
  ]);
}

async function writeSwcrc() {
  const swcrc = SWC_DEFAULT();
  swcrc.jsc.transform.optimizer.globals.vars.DEV_MODE = 'true';
  await writeFile('.swcrc', JSON.stringify(swcrc));
}

async function main() {
  await Promise.all([killFirebasePorts(), writeSwcrc()]);
  const watchProgram = spawn('npm run build:watch', {
    shell: true,
    stdio: 'ignore',
  });

  const emulatorProgram = spawn('firebase emulators:start', {
    shell: true,
    stdio: 'inherit',
  });
}

main();
