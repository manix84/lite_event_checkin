require('dotenv-flow').config({
  silent: true
});

const { sha256 } = require('js-sha256');

const SERVER_SALT = process.env.SERVER_SALT || '';

function generateHash(firstName, lastName, salt) {
  return sha256(
    `GuestHash::${firstName}${lastName}${salt}${SERVER_SALT}`
  );
}

module.exports = {
  generateGuestHash: generateHash
};
