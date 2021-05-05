const chalk = require('chalk');
const DEBUG = process.env.DEBUG || false;

const
  debug = (msg) => {
    if (DEBUG) console.log(chalk.green(msg));
  },
  info = (msg) => {
    console.log(chalk.green(msg));
  },
  error = (msg) => {
    console.log(chalk.red(msg));
  };

module.exports = {
  debug,
  info,
  error
};
