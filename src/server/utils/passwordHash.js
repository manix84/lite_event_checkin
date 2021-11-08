require('dotenv-flow').config({
  silent: true
});

const { sha256 } = require('js-sha256');

const SERVER_SALT = process.env.SERVER_SALT || '';

function generateHash(userPassword, userSalt) {
  return sha256(
    `Password::${userPassword}:${userSalt}:${SERVER_SALT}`
  );
}

module.exports = {
  generatePasswordHash: generateHash
};
