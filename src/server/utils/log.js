require('dotenv-flow').config({
  silent: true
});
const chalk = require('chalk');

const DEBUG = process.env.DEBUG || false;

const
  newLine = () => { console.log();},
  debug = (msg, ...details) => {
    if (DEBUG) console.log(chalk.magenta(msg,...details));
  },
  info = (msg, ...details) => {
    console.log(chalk.blue(msg, ...details));
  },
  warn = (msg, ...details) => {
    console.log(chalk.yellow(msg, ...details));
  },
  error = (msg, ...details) => {
    console.log(chalk.red(msg, ...details));
  };

module.exports = {
  newLine,
  debug,
  info,
  warn,
  error
};
