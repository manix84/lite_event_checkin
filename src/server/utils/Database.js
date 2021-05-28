require('dotenv-flow').config({
  silent: true
});

const mysql = require('mysql');
const { error, debug } = require('./log');
const rdmString = require('./rdmString');
const { generatePasswordHash } = require('./passwordHash');
const { generateScannerHash } = require('./scannerHash');

const dbStore = {};

class Database {
  async _runQuery(query, callback = () => { }) {
    const connection = await mysql.createConnection(
      process.env.CLEARDB_DATABASE_URL
    );
    connection.connect();

    await connection.query({
      sql: query,
      timeout: 4000, // 4s
    }, (err, results) => {
      if (err)
        error('err', err);

      callback(results, err)
    })
    connection.end();
  }
  _collectGuests() {
    if (!('guests' in dbStore)) {
      dbStore['guests'] = dbStore['guests'] || {};
      this._runQuery(
        `SELECT * FROM guests`,
        (rows) => {
          rows.forEach((row) => {
            dbStore['guests'][row.guestHash] = {
              lastName: row.lastName,
              firstName: row.firstName,
              salt: row.salt,
              checkedIn: Boolean(row.checkedIn),
              checkinTime: Number(row.checkinTime),
              eventID: row.eventID
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
          rows.forEach((row) => {
            dbStore['users'][row.id] = {
              id: row.id,
              displayName: row.displayName,
              username: row.username,
              password: row.passwordHash,
              salt: row.salt,
              scannerHash: row.scannerHash,
            };
          });
        }
      );
    }
  }
  _collectEvents() {
    if (!('events' in dbStore)) {
      dbStore['events'] = dbStore['events'] || {};
      this._runQuery(
        `SELECT * FROM events`,
        (rows) => {
          rows.forEach((row) => {
            dbStore['events'][row.id] = {
              id: row.id,
              name: row.name,
              ownerUserID: row.ownerUserID,
              customLogoURL: row.customLogoURL
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
    this._collectUsers();
    this._collectEvents();
  }

  authenticateUser(username, password) {
    let found = false;
    let authenticated = false;
    let data = {};
    Object.entries(dbStore['users']).forEach(([_id, row]) => {
      if (row.username.toLowerCase() === username.toLowerCase()) {
        const passwordHash = generatePasswordHash(password, row.salt);
        found = true;
        if (row.password === passwordHash) {
          authenticated = true;
          data = {
            id: row.id,
            displayName: row.displayName,
            username: row.username,
            salt: row.salt,
            scannerHash: row.scannerHash,
          };
        }
      }
    })
    return {
      found,
      authenticated,
      data
    }
  }

  registerUser(username, password, displayName, callback) {
    const salt = rdmString();
    const scannerHash = generateScannerHash(salt);
    const passwordHash = generatePasswordHash(password, salt);

    let userID;

    this._runQuery(
      `INSERT INTO users (username, passwordHash, displayName, salt, scannerHash) VALUES (${mysql.escape(username)}, ${mysql.escape(passwordHash)}, ${mysql.escape(displayName)}, ${mysql.escape(salt)}, ${mysql.escape(scannerHash)});`,
      (results, err) => {
        userID = results && results.insertId;

        if (Boolean(userID) && !isNaN(userID)) {
          dbStore['users'][userID] = {
            id: userID,
            displayName: displayName,
            username: username,
            password: passwordHash,
            salt: salt,
            scannerHash: scannerHash
          };
          callback({
            success: Boolean(userID),
            id: userID,
            displayName: displayName,
            username: username,
            salt: salt,
            scannerHash: scannerHash
          });
        } else {
          callback({
            success: false,
            reason: err.code,
            reasonText: err.sqlMessage
          });
        }
      }
    );
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
