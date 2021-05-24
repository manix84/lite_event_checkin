const chalk = require('chalk');
require('dotenv-flow').config({
  silent: true
});

const DEBUG = process.env.DEBUG || false;

const
  debug = (msg, ...details) => {
    if (DEBUG) console.log(chalk.green(msg), ...details);
  },
  info = (msg, ...details) => {
    console.log(chalk.green(msg), ...details);
  },
  error = (msg, ...details) => {
    console.log(chalk.red(msg), ...details);
  };

module.exports = {
  debug,
  info,
  error
};
