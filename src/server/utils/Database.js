const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const DEBUG = true;

const
  debug = (msg) => {
    if (DEBUG) console.log(chalk.green(msg));
  },
  error = (msg) => {
    console.log(chalk.red(msg));
  };


const dbStore = {};

class Database {
  constructor(
    dbID,
    root = __dirname,
    options
  ) {
    const dbID_normalized = path.normalize(path.join(root, dbID));
    this.dbID = dbID_normalized;
    this.options = Object.assign({
      writeOnSet: true,
      refreshSeconds: 20
    }, options);

    if (this._checkExistence()) {
      this._connect(this.dbID);
      debug(`${chalk.bold(this.dbID)} found.`);
    } else {
      error(`Can't find ${chalk.bold(this.dbID)}`);
    }
  }

  _connect(dbID) {
    if (!(dbID in dbStore)) {
      dbStore[dbID] = this._read();
    }
  }

  _sync(force = false) {
    debug(`${this.lastSynced + (this.options.refreshSeconds * 1000)} < ${Date.now()}`);
    if (
      ((this.lastSynced + (this.options.refreshSeconds * 1000)) < Date.now()) ||
      force
    ) {
      dbStore[this.dbID] = this._read();
      debug(`Updating Database: ${this.dbID}`);
    }
    return true;
  }

  _checkExistence() {
    return fs.existsSync(this.dbID);
  }

  _read() {
    const output = {};
    try {
      const data = fs.readFileSync(this.dbID, 'utf8');
      Object.assign(output, JSON.parse(data));
      this.lastSynced = Date.now();
    } catch (err) {
      error(err);
    }
    return output;
  }

  _write() {
    fs.writeFileSync(
      this.dbID,
      JSON.stringify(dbStore[this.dbID], null, 2)
    );
  }

  get(key) {
    this._sync();
    if (key in dbStore[this.dbID]) {
      return dbStore[this.dbID][key];
    }
    return false;
  }

  set(key, data) {
    dbStore[this.dbID][key] = data;
    if (this.options.writeOnSet) {
      this._write();
    }
  }

  getAll() {
    this._sync();
    return dbStore[this.dbID];
  }
}

module.exports = Database;
