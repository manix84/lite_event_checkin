# lite_event_checkin

A simple QR Code check-in system.

## Planned Features

- Take a CSV of names (Last, First)
- Generate Key SHA1(First Name + Last Name + Salt)
  - Store keys against names
- Generate QR code from Key
- Generate Output CSV (LastName:String, FirstName:String, CheckedIn:Boolean, QRCode:URL)
- Create Web Interface
  - QR Scanner (Show screen in canvas + Click to scan)
  - List All Names
  - Cross out checked in
  - 
