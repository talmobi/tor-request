# tor-request - Simple HTTP client through Tor network

## Simple to use
```js
var tr = require('tor-request');
tr.request('https://api.ipify.org', function (err, res, body) {
  if (!err && res.statusCode == 200) {
    console.log("Your public (through Tor) IP is: " + body);
  }
});
```
## Demo
[http://tor.jin.fi/](http://tor.jin.fi/)

## About
A very simple and light wrapper around the fantastic [request](https://github.com/request/request) library to send http(s) requests through Tor.

## How
Tor communicates through the SOCKS Protocol so we need to create and configure appropriate SOCKS Agent objects for Node's http and https core libraries using the [socks library](https://github.com/JoshGlazebrook/socks).

## Installation

from npm
```js
npm install tor-request
```
from source
```js
git clone https://github.com/finnpaws/tor-request
cd tor-request
npm install
```

## Requirements
A Tor client.

Either run it yourself locally (recommended) or specify the address for a publically available one.

Tor is available for a multitude of systems.

On Debian you can install and run a relatively up to date Tor with.

```bash
apt-get install tor # should auto run as daemon after install
```

On OSX you can install with homebrew

```bash
brew install tor
tor & # run as background process
```

See [TorProject.org](https://www.torproject.org/docs/debian.html.en) for detailed installation guides for all platforms.


The Tor client by default runs on port 9050 (localhost of course). This is also the default address tor-request uses. You can change it if needed.

```js
tr.setTorAddress(ipaddress, port); // "localhost" and 9050 by default
```

## API

```js
// index.js
module.exports = {
  /**
   * This is a light wrapper function around the famous request nodeJS library, routing it through
   * your Tor client.
   *
   * Use it as you would use the request library - see their superb documentation.
   * https://github.com/request/request
   */
  request: function (url || opts, function (err, res, body))
  
  /**
   * @param {string} ipaddress - ip address of tor server (localhost by default)
   * @param {number} port - port of the tor server (by default tor runs on port 9050)
   */
  setTorAddress: function (ipaddress, port) // defaults to localhost on port 9050
  
  /**
   * @param {function} done - the callback function to tell you when the process is done
   * @param {object} err - null if tor session renewed successfully
   */
  newTorSession: function ( done(err) ) // clears and renews the Tor session (i.e., you get a new IP)
  // NOTE: This is usually rate limited - so use wisely.
  // NOTE2: This is done by communicating with the Tor Client at the Tor ControlPort (default: localhost:9051)
  // The ControlPort is disabled by default -> enable it by uncommenting the line "#ControlPort 9051" in
  // your /etc/tor/torrc file.
  //
  // In order to gain access to the control port you need to set its password. Update the line
  // "HashControlPassword 16:D14CC... " in your /etc/tor/torrc file with the password you get by running
  // "tor --hash-password '' | tail -n 1". Finally remember to restart tor to enable the changes.
  // "service tor restart"
}
```

## Test

Tests the original request library by connecting to http://api.ipify.org - returning your ip. Then makes a few additional requests, now through tor-request, and makes sure the ip's are different (went through tor).

```js
mocha test/test.js
```

## LICENSE
MIT
