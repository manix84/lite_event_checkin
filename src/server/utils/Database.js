const mysql = require('mysql');
const dotenv = require('dotenv-flow');
const { debug, error } = require('./log');

dotenv.config();

const dbStore = {};


class Database {
  async _runQuery(query, callback = () => { }) {
    const connection = await mysql.createConnection(
      process.env.CLEARDB_DATABASE_URL
    );
    connection.connect();

    await connection.query({
      sql: query,
      timeout: 10000, // 4s
    }, (err, rows) => {
      if (err)
        error('err', err);

      callback(rows)
    })
    connection.end();
  }

  constructor(
    dbID,
    options
  ) {
    this.dbID = dbID;
    this.options = Object.assign({
      writeOnSet: true,
      refreshSeconds: 20
    }, options);
    this._connect();
  }

  _connect() {
    if (!(this.dbID in dbStore)) {
      dbStore[this.dbID] = dbStore[this.dbID] || {};
      this._runQuery(
        `SELECT * FROM ${this.dbID}`,
        (rows) => {
          rows.forEach((obj) => {
            dbStore[this.dbID][obj.guestHash] = {
              lastName: obj.lastName,
              firstName: obj.firstName,
              salt: obj.salt,
              checkedIn: Boolean(obj.checkedIn)
            };
          });
        }
      );
    }
  }

  get(key) {
    debug('get', dbStore, key);
    if (key in dbStore[this.dbID]) {
      return dbStore[this.dbID][key];
    }
    return false;
  }

  set(key, data) {
    dbStore[this.dbID][key] = data;
    if (this.options.writeOnSet) {
      this._runQuery(
        `REPLACE INTO ${this.dbID} (guestHash, lastName, firstName, salt, checkedIn, checkinTime) VALUES (${mysql.escape(key)}, ${mysql.escape(data.lastName)}, ${mysql.escape(data.firstName)}, ${mysql.escape(data.salt)}, ${mysql.escape(data.checkedIn)}, ${mysql.escape(data.checkinTime)});`
      );
    }
  }

  getAll() {
    debug('getAll', dbStore);
    return dbStore[this.dbID];
  }
}

module.exports = Database;
