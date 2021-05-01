# lite_event_checkin

A simple QR Code check-in system.

## Planned Features

- [ ] Take a CSV of names (Last, First)
- [x] Generate Key SHA256(Guest Details + Guest Salt + Server Salt)
  - [x] Store keys against names
- [x] Generate QR code from Key
- [ ] Generate Output CSV (LastName:String, FirstName:String, CheckedIn:Boolean, QRCode:URL)
- [x] Create Web Interface
  - [x] QR Scanner (Show screen in canvas <del> +Click to scan</del>)
  - [x] List All Names (/guestlist)
  - [x] Cross out checked in
  - 
