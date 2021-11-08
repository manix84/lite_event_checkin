require('dotenv-flow').config({
  silent: true
});

const { sha256 } = require('js-sha256');

const SERVER_SALT = process.env.SERVER_SALT || '';

function generateHash(salt) {
  return sha256(
    `ScannerHash::${salt}${SERVER_SALT}`
  );
}

module.exports = {
  generateScannerHash: generateHash
};
