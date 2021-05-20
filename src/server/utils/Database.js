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


  _collectGuests() {
    if (!('guests' in dbStore)) {
      dbStore['guests'] = dbStore['guests'] || {};
      this._runQuery(
        `SELECT * FROM guests`,
        (rows) => {
          rows.forEach((obj) => {
            dbStore['guests'][obj.guestHash] = {
              lastName: obj.lastName,
              firstName: obj.firstName,
              salt: obj.salt,
              checkedIn: Boolean(obj.checkedIn),
              checkinTime: Number(obj.checkinTime)
            };
          });
        }
      );
    }
  }
  _collectUsers() {
    if (!('users' in dbStore)) {
      dbStore['users'] = dbStore['users'] || {};
      this._runQuery(
        `SELECT * FROM users`,
        (rows) => {
          rows.forEach((obj) => {
            dbStore['users'][obj.guestHash] = {
            };
          });
        }
      );
    }
  }

  constructor(
    options
  ) {
    this.options = Object.assign({
      writeOnSet: true,
      refreshSeconds: 20
    }, options);
    this._collectGuests();
  }

  getGuest(guestHash) {
    // debug('get', dbStore, guestHash);
    if (guestHash in dbStore['guests']) {
      return dbStore['guests'][guestHash];
    }
    return false;
  }

  addGuest(guestData) {

  }

  updateGuest(key, guestData) {
    dbStore['guests'][key] = guestData;
    if (this.options.writeOnSet) {
      this._runQuery(
        `REPLACE INTO guests (guestHash, lastName, firstName, salt, checkedIn, checkinTime) VALUES (${mysql.escape(key)}, ${mysql.escape(guestData.lastName)}, ${mysql.escape(guestData.firstName)}, ${mysql.escape(guestData.salt)}, ${mysql.escape(guestData.checkedIn)}, ${mysql.escape(guestData.checkinTime)});`
      );
    }
  }

  getAllGuests() {
    // debug('getAll', dbStore);
    return dbStore['guests'];
  }
}

module.exports = Database;
