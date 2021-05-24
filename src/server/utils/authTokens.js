const { sha256 } = require('js-sha256');
require('dotenv-flow').config({
  silent: true
});

const SERVER_SALT = process.env.SERVER_SALT || '';

function generate(userID, userSalt, expirationTime) {
  return sha256(`UserToken::${userID}:${expirationTime}:${userSalt}:${SERVER_SALT}`);
}

function validate(authToken, userID, userSalt, expirationTime) {
  const validToken = generate(userID, userSalt, expirationTime);
  return (authToken === validToken);
};

module.exports = {
  generateAuthToken: generate,
  validateAuthToken: validate
}
