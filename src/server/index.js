const express = require('express');
const Database = require('./utils/Database');
const rdmString = require('./utils/randomStringGenerator');
const { sha256 } = require('js-sha256');
const dotenv = require('dotenv-flow');

dotenv.config();

const GuestList = new Database('../guests.json', __dirname);
const SERVER_SALT = process.env.REACT_APP_SALT || '';

console.log(`SERVER_SALT: ${SERVER_SALT}`);

const port = process.env.PORT || 5000;
const app = express();
require('express-ws')(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, _res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});

app.get('/api/collectGuests', (req, res) => {
  const guestlist = GuestList.getAll();
  console.log(`collectGuests: ${guestlist}`);
  res.send(guestlist);
});

app.get('/api/collectGuest/:ticketID', (req, res) => {
  const guest = GuestList.get(req.params.ticketID);
  res.send(guest);
});

app.ws('/api/test', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req.testing);
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
    console.log({
      guest: updatedGuestObj
    });
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
