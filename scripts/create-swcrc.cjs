const { writeFile } = require('node:fs/promises');
const { SWC_DEFAULT } = require('./constants.cjs');
(async () => {
  await writeFile('.swcrc', JSON.stringify(SWC_DEFAULT()));
})();
