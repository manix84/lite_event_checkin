const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors')
const { sha256 } = require('js-sha256');
const dotenv = require('dotenv-flow');
const events = require('events');
const https = require('https');

const Database = require('./utils/Database');
const rdmString = require('./utils/randomStringGenerator');
const { debug, info } = require('./utils/log');

dotenv.config();

const GuestList = new Database('../guests.json', __dirname);
const SERVER_SALT = process.env.REACT_APP_SALT || '';

debug(`SERVER_SALT: ${SERVER_SALT}`);

const port = process.env.PORT || 5000;
const app = express();
let expressWs;
let httpsServer = app;

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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

wss.on('connection', (ws) => {
  debug('WSS Connection Open')
})
wss.on('close', (ws) => {
  debug('WSS Connection closed.')
});

app.ws('/ws-api/collectGuests', function (ws, req) {
  event.on("guestUpdated", (guestHash) => {
    const guestData = {};
    guestData[guestHash] = GuestList.get(guestHash);
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        guestsPartial: guestData
      }));
    }
  });
});

app.ws('/ws-api/collectGuest/:ticketID', function (ws, req) {
  event.on("guestUpdated", (guestHash) => {
    const guestData = {};
    guestData[guestHash] = GuestList.get(guestHash);
    if ((ws.readyState === 1) && req.params.ticketID === guestHash) {
      ws.send(JSON.stringify({
        guestsPartial: guestData
      }));
    }
  });
});

app.get('/api/collectGuests', (req, res) => {
  const guestlist = GuestList.getAll();
  res.send(guestlist);
});

app.get('/api/collectGuest/:ticketID', (req, res) => {
  const guest = GuestList.get(req.params.ticketID);
  res.send(guest);
});

app.post('/api/checkinGuest', (req, res) => {
  const guestHash = req.body.guestHash;
  debug(`GuestHash: ${guestHash}`);
  const currentGuestObj = GuestList.get(guestHash);
  if (!currentGuestObj) {
    res.send({
      success: false,
      reason: 'GUEST_NOT_FOUND'
    });
  } else if (currentGuestObj.checkedIn) {
    res.send({
      success: false,
      reason: 'GUEST_ALREADY_CHECKEDIN'
    });
  } else {
    const updatedGuestObj = Object.assign(currentGuestObj, {
      checkedIn: true
    });
    GuestList.set(guestHash, updatedGuestObj);
    res.send({
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
  const hash = sha256(`${firstName}${lastName}${salt}${SERVER_SALT}`);
  GuestList.set(hash, {
    firstName,
    lastName,
    salt,
    checkedIn: false
  });
  res.send({ success: true });
});

if (process.env.NODE_ENV === 'production') {
  const buildRoot = path.join(__dirname, '..', '..', 'build');
  app
    .use(express.static(buildRoot))
    .get('/*', function (req, res) {
      res.sendFile(path.join(buildRoot, 'index.html'));
    });
}

httpsServer.listen(port, () => info(`Listening on port ${port}`));
