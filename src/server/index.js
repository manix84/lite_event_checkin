const express = require('express');
const path = require('path');
const cors = require('cors')
const { sha256 } = require('js-sha256');
const dotenv = require('dotenv-flow');
const events = require('events');

const Database = require('./utils/Database');
const rdmString = require('./utils/randomStringGenerator');

dotenv.config();

const GuestList = new Database('../guests.json', __dirname);
const SERVER_SALT = process.env.REACT_APP_SALT || '';

console.log(`SERVER_SALT: ${SERVER_SALT}`);

const port = process.env.PORT || 5000;
const app = express();
const expressWs = require('express-ws')(app);
const event = new events.EventEmitter();
const wss = expressWs.getWss();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

wss.on('connection', (ws) => {
  console.log('WSS Connection Open')
})
wss.on('close', () => {
  console.log('WSS Connection closed.')
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

if (process.env.NODE_ENV === 'production') {
  const buildRoot = path.join(__dirname, '..', '..', 'build')
  app.use(express.static(buildRoot));

  app.get('/', function (req, res) {
    res.sendFile(path.join(buildRoot, 'index.html'));
  });
}

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
  console.log(`GuestHash: ${guestHash}`);
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

app.listen(port, () => console.log(`Listening on port ${port}`));
