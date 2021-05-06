# lite_event_checkin

A simple QR Code check-in system.

## Planned Features

- [ ] Take a CSV of names (Last, First)
- [x] Generate Key SHA256(Guest Details + Guest Salt + Server Salt)
  - [x] Store keys against names
- [x] Generate QR code from Key
- [x] Generate Output CSV (LastName:String, FirstName:String, CheckedIn:Boolean, QRCode:URL)
- [x] Create Web Interface
  - [x] QR Scanner (`/scanner`) (Show screen in canvas <del> +Click to scan</del>)
  - [x] Add Sound effect to Scanner for feedback.
  - [x] List All Names (`/guestlist`)
  - [x] Cross out checked in

## New & Upcoming Features

- [x] Ticket/QR page for guests.
- [x] AddGuest page to manually add guests (`/addGuest` - may remove after CSV import is working).
- [ ] Login to cover Scanner & Guestlist pages.
  - [ ] Leave guest ticket page unlocked.
- [x] <del>Move to context for storing Guestlist across pages.</del>
  - [x] Move from context to websockets to update guest data.
- [x] Implement About Page, so it looks a little more professional.
- [x] Add some styling so it doesn't look like a developer through this together in a week.
- [ ] Add checkin time stamp support.
- [x] Migrate from JSON DB to MySQL.
