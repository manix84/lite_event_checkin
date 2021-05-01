import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const DEBUG = true;

const
  debug = (msg: any) => {
    if (DEBUG) console.log(chalk.green(msg));
  },
  error = (msg: any) => {
    console.log(chalk.red(msg));
  };

interface DbStoreProps {
  [dbID: string]: {
    [key: string]: any;
  };
}

interface DatabaseOptionsProps {
  writeOnSet: boolean;
  refreshSeconds: number;
}

const dbStore: DbStoreProps = {};

class Database {
  dbID: string;
  options: DatabaseOptionsProps;
  lastSynced: number = 0;

  constructor(
    dbID: string,
    root: string = __dirname,
    options?: DatabaseOptionsProps
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

  _connect(dbID: string) {
    if (!(dbID in dbStore)) {
      dbStore[dbID] = this._read();
    }
  }

  _sync(force: boolean = false) {
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
    const output: object = {};
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

  get(key: string) {
    this._sync();
    if (key in dbStore[this.dbID]) {
      return dbStore[this.dbID][key];
    }
    return false;
  }

  set(key: string, data: object) {
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

export default Database;

module.exports = Database;
