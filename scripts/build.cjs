const { SWC_DEFAULT } = require('./constants.cjs');
const { writeFile } = require('node:fs/promises');
const { spawn } = require('node:child_process');

async function writeSwcrc() {
  const swcrc = SWC_DEFAULT();
  swcrc.minify = true;
  await writeFile('.swcrc', JSON.stringify(swcrc));
}

(async () => {
  await writeSwcrc();
  const buildProgram = spawn('npm', ['run', 'build:app'], {
    shell: true,
    stdio: 'inherit',
  });
})();
