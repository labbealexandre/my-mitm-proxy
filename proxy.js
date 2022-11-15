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

async function runProxy(search) {
  const server = mockttp.getLocal({
    https: {
      keyPath: PRIVATE_KEY,
      certPath: PUBLIC_KEY,
    },
  });

  const requests = {};

  server
    .forAnyRequest()
    .thenPassThrough({
      beforeRequest: (request) => {
        requests[request.id] = request.url;
        request
          .body
          .getText()
          .then((text) => {
            if (text.includes(search)) {
              console.log(`[REQ]: ${request.url}`);
            }
          });
      },
      beforeResponse: (response) => {
        if (!search) {
          return;
        }

        response
          .body
          .getText()
          .then((text) => {
            if (text.includes(search)) {
              console.log(`[RES]: ${requests[response.id]}`);
            }
          });
      },
    });

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
    builder: {
      search: {
        describe: 'Search pattern in response body',
        type: 'string',
      },
    },
    handler({ search }) {
      runProxy(search);
    },
  }).strict();

if (!argv._[0]) {
  yargs.showHelp();
}
