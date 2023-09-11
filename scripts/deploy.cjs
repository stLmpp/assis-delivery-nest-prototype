const { writeFile } = require('node:fs/promises');
const { execSync } = require('node:child_process');

const { GOOGLE_APPLICATION_CREDENTIALS_JSON, GOOGLE_APPLICATION_CREDENTIALS } =
  process.env;

if (!GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON variable');
}

if (!GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS variable');
}

try {
  JSON.parse(GOOGLE_APPLICATION_CREDENTIALS_JSON);
} catch {
  throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON variable');
}

async function main() {
  await writeFile(
    GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_APPLICATION_CREDENTIALS_JSON,
  );
  execSync('firebase deploy --only functions -f', {
    stdio: 'inherit',
  });
}

main().then(() => {
  console.log('Deployment successful!');
});
