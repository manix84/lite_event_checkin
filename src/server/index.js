const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { sha256 } = require('js-sha256');
const events = require('events');
const https = require('https');
const { Parser } = require('json2csv');
const { generateAuthToken } = require('./utils/authTokens');
require('dotenv-flow').config({
  silent: true
});

const Database = require('./utils/Database');
const { debug, info } = require('./utils/log');
const rdmString = require('./utils/randomStringGenerator');

const db = new Database();

const SERVER_SALT = process.env.SERVER_SALT || '';
const AUTH_EXPIRATION_HOURS = process.env.AUTH_EXPIRATION_HOURS || 24;
const EXTERNAL_USER_ID_OFFSET = process.env.EXTERNAL_USER_ID_OFFSET || 1000;

debug(`SERVER_SALT: ${SERVER_SALT}`);

const port = process.env.PORT || 5000;
const app = express();
let expressWs;
let httpsServer = app;
const readyStates = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

if (process.env.NODE_ENV !== 'production') {
  httpsServer = https
    .createServer({
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt')
    }, app);
  expressWs = require('express-ws')(app, httpsServer);
} else {
  expressWs = require('express-ws')(app);
}

const event = new events.EventEmitter();
const wss = expressWs.getWss();

wss.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

wss.on('connection', (ws, req) => {
  ws.id = wss.getUniqueID();
  debug(`${ws.id}: WSS Connected`);
});
wss.on('disconnect', (ws, req) => {
  debug(`${ws.id}: WSS Disconnected`);
});
wss.on('error', (ws, req) => {
  debug(`${ws.id}: WSS Connection errored`);
});
wss.on('listening', (ws, req) => {
  debug(`WSS Listening on port ${port}`);
});
wss.on('open', (ws, req) => {
  debug(`${ws.id}: WSS Connection opened`);
});
wss.on('close', (ws, req) => {
  debug(`${ws.id}: WSS Connection closed`);
});
wss.on('upgrade', (ws, req) => {
  debug(`${ws.id}: WSS Connection upgraded`);
});

app.ws('/ws-api/collectGuests', function (ws, req) {
  event.on("guestUpdated", (guestHash) => {
    const guestData = {};
    guestData[guestHash] = db.getGuest(guestHash);
    if (ws.readyState === readyStates.OPEN) {
      ws.send(JSON.stringify({
        guestsPartial: guestData
      }));
    }
  });
});

app.ws('/ws-api/collectGuest/:ticketID', function (ws, req) {
  event.on("guestUpdated", (guestHash) => {
    const guestData = {};
    guestData[guestHash] = db.getGuest(guestHash);
    if (ws.readyState === readyStates.OPEN) {
      if (req.params.ticketID === guestHash) {
        ws.send(JSON.stringify({
          guestsPartial: guestData,
          guestFound: true
        }));
      } else {
        ws.send(JSON.stringify({
          guestfound: false
        }));
      }
    }
  });
});

app.get('/api/collectGuests', (req, res) => {
  const guestlist = db.getAllGuests();
  res.json(guestlist);
});

app.get('/api/collectGuest/:ticketID', (req, res) => {
  const guest = db.getGuest(req.params.ticketID);
  res.json(guest);
});

app.get('/files/export/:type', (req, res) => {
  const guests = db.getAllGuests();
  const dbObj = [];
  const filename = `guestlist_${new Date().toISOString()}`
  Object.entries(guests).forEach(([guestHash, guestData]) => {
    dbObj.push({
      lastName: guestData.lastName,
      firstName: guestData.firstName,
      ticketURL: `https://${req.hostname}/ticket/${guestHash}`,
      checkedIn: guestData.checkedIn,
      checkinTime: guestData.checkinTime ? new Date(guestData.checkinTime).toISOString() : undefined
    })
  })
  switch (req.params.type) {
    case 'csv':
    default:
      const json2csv = new Parser();
      res.status(200)
        .attachment(`${filename}.csv`)
        .send(json2csv.parse(dbObj));
  }
})

app.post('/api/requestAuthToken', (req, res) => {
  const issueTime = Date.now();
  const authExpiration = issueTime + (AUTH_EXPIRATION_HOURS * 60 * 60 * 1000); // 24hr expiry.

  const user = db.authenticateUser(
    req.body.username,
    req.body.password
  );

  if (user.found && user.authenticated) {
    res.json({
      success: true,
      isAuthenticated: true,
      authToken: generateAuthToken(
        user.data.id,
        user.data.salt,
        authExpiration
      ),
      authExpiration,
      authUserID: (user.data.id + EXTERNAL_USER_ID_OFFSET)
      // tokenIssued: issueTime,
      // tokenExpires: expireTime
    });
  } else {
    res.json({
      success: false,
      isAuthenticated: false
    })
  }
})

app.post('/api/checkinGuest', (req, res) => {
  const guestHash = req.body.guestHash;
  debug(`GuestHash: ${guestHash}`);
  const currentGuestObj = db.getGuest(guestHash);
  if (!currentGuestObj) {
    res.json({
      success: false,
      reason: 'GUEST_NOT_FOUND'
    });
  } else if (currentGuestObj.checkedIn) {
    res.json({
      success: false,
      reason: 'GUEST_ALREADY_CHECKEDIN'
    });
  } else {
    const updatedGuestObj = Object.assign(currentGuestObj, {
      checkedIn: true,
      checkinTime: Date.now()
    });
    db.updateGuest(guestHash, updatedGuestObj);
    res.json({
      success: true,
      guest: {
        hash: guestHash,
        firstName: updatedGuestObj.firstName,
        lastName: updatedGuestObj.lastName
      }
    });
    event.emit("guestUpdated", guestHash)
  }
});

// app.post('/api/importGuests', (req, res) => {

// })

app.post('/api/addGuest', (req, res) => {
  const salt = rdmString();
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const hash = sha256(`guest::${firstName}${lastName}${salt}${SERVER_SALT}`);
  db.addGuest(hash, {
    firstName,
    lastName,
    salt,
    checkedIn: false
  });
  res.json({
    success: true
  });
});

if (process.env.NODE_ENV === 'production') {
  const buildRoot = path.join(__dirname, '..', '..', 'build');
  app
    .use(express.static(buildRoot))
    .get('/*', function (_req, res) {
      res.sendFile(path.join(buildRoot, 'index.html'));
    });
}

httpsServer.listen(port, () => info(`Listening on port ${port}`));
