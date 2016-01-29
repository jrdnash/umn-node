# umn-node
An API to interface with the University of Minnesota's website.

`var umn = new (require('umn'))('userx123', 'password123');`

## Installation

`npm install umn`

## Authentication

All of umn-node's functions will auto-authenticate using the provided credentials, so no need to worry about session expiration.

## API documentation
### Class schedule

`umn.schedule((err, schedule) => console.log(schedule));`

### Balance (Gopher Gold, FlexDine, etc.)

`umn.balance((err, balance) => console.log(balance));`


