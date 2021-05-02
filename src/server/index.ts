import express from 'express';
import Database from './utils/Database';
import rdmString from '../shared/utils/randomStringGenerator';
import { sha256 } from 'js-sha256';
import dotenv from 'dotenv-flow';

dotenv.config();

const GuestList = new Database('../guests.json', __dirname);
const SERVER_SALT: string = process.env.REACT_APP_SALT || '';

console.log(`SERVER_SALT: ${SERVER_SALT}`);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/collectGuests', (req: any, res: any) => {
  const guestlist = GuestList.getAll();
  console.log(`collectGuests: ${guestlist}`);
  res.send(guestlist);
});

app.get('/api/collectGuest/:ticketID', (req: any, res: any) => {
  const guest = GuestList.get(req.params.ticketID);
  res.send(guest);
});

app.post('/api/checkinGuest', (req: any, res: any) => {
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

// app.post('/api/importGuests', (req: any, res: any) => {

// })

app.post('/api/addGuest', (req: any, res: any) => {
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
