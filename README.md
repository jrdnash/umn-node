# umn-node
An API to interface with the University of Minnesota's website.

`var umn = new (require('umn'))('userx123', 'password123');`

### Class schedule

`umn.schedule((err, schedule) => console.log(schedule));`

### Balance (Gopher Gold, FlexDine, etc.)

`umn.balance((err, balance) => console.log(balance));`

## Authentication

All of umn-node's functions will auto-authenticate using the provided credentials, so no need to worry about session expiration.
