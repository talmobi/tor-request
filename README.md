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
git clone https://github.com/talmobi/tor-request
cd tor-request
npm install
```

## Requirements
A Tor client.

Either run it yourself locally (recommended) or specify the address for a publically available one.

Tor is available for a multitude of systems.

On **Debian** you can install and run a relatively up to date Tor with.

```bash
apt-get install tor # should auto run as daemon after install
```

On **OSX** you can install with homebrew

```bash
brew install tor
tor & # run as background process
```

On **Windows** download the tor expert bundle (not the browser), unzip it and run tor.exe.

```bash
./Tor/tor.exe # --default-torrc PATH_TO_TORRC
```

See [TorProject.org](https://www.torproject.org/docs/debian.html.en) for detailed installation guides for all platforms.


The Tor client by default runs on port 9050 (localhost of course). This is also the default address tor-request uses. You can change it if needed.

```js
tr.setTorAddress(ipaddress, port); // "localhost" and 9050 by default
```

## (Optional) Configuring Tor, enabling the ControlPort
Configure tor by editing the torrc file usually located at /etc/tor/torrc or /lib/etc/tor/torrc or ~/.torrc - Alternatively you can supply the path yourself with the **--default-torrc PATH** command line argument. See [Tor Command-Line Options](https://www.torproject.org/docs/tor-manual.html.en)

```bash
# sample torrc file
#ControlPort 9051 # uncomment to enable control port, allowing all localhost connections to send signals and modify tor
#HashedControlPassword HASHED_PASSWORD # uncomment to require password authentication for control port access
# Generate a hashed control password with the --hash-password command line argument: "tor --hash-password PASSWORD | tail -n 1"
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
   * Helper object to communicate with the tor ControlPort. Requires an enabled ControlPort on tor.
   */
  TorControlPort: {
    password: "", // default ControlPort password
    host: "localhost", // default address
    port: 9051, // default ControlPort
    
    /**
     * @param {Array.string} commands - signals that are sent to the ControlPort
     */
    send: function (commands, done(err, data))
  }
  
  /**
   * A set of predefined TorControlPort commands to request and verify tor for a new session (get a new ip to use).
   *
   * @param {function} done - the callback function to tell you when the process is done
   * @param {object} err - null if tor session renewed successfully
   */
  newTorSession: function ( done(err) ) // clears and renews the Tor session (i.e., you get a new IP)
  
}
```

## Test

Tests the original request library by connecting to http://api.ipify.org - returning your ip. Then makes a few additional requests, now through tor-request, and makes sure the ip's are different (went through tor).

```js
mocha test/test.js
```

## LICENSE
MIT
