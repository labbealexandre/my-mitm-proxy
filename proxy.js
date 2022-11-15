const mockttp = require('mockttp');
const yargs = require('yargs');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const CERTS_FOLDER = 'certs';
const PRIVATE_KEY = `${CERTS_FOLDER}/key.pem`;
const PUBLIC_KEY = `${CERTS_FOLDER}/cert.pem`;

async function generateCertificates() {
  if (!fs.existsSync(CERTS_FOLDER)) {
    fs.mkdirSync(CERTS_FOLDER);
  }

  const { key, cert } = await mockttp.generateCACertificate();
  fs.writeFileSync(PRIVATE_KEY, key);
  fs.writeFileSync(PUBLIC_KEY, cert);
}

async function runProxy() {
  const server = mockttp.getLocal({
    https: {
      keyPath: PRIVATE_KEY,
      certPath: PUBLIC_KEY,
    },
  });

  server
    .forAnyRequest()
    .thenPassThrough();

  await server.start(parseInt(process.env.PORT, 10));
  console.log(`Server running on port ${server.port}`);
}

const { argv } = yargs
  .command({
    command: 'generate',
    describe: 'Generate new CA certificates',
    handler() {
      generateCertificates();
    },
  }).command({
    command: 'proxy',
    describe: 'Run MITM proxy',
    handler() {
      runProxy();
    },
  }).strict();

if (!argv._[0]) {
  yargs.showHelp();
}
