# tor-request - Simple HTTP client through Tor network

[![npm](https://img.shields.io/npm/v/tor-request.svg?maxAge=2592000)](https://www.npmjs.com/package/tor-request)
[![npm](https://img.shields.io/npm/dm/tor-request.svg?maxAge=2592000)](https://www.npmjs.com/package/tor-request)
[![npm](https://img.shields.io/npm/l/tor-request.svg?maxAge=2592000)](https://www.npmjs.com/package/tor-request)

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
You need to enable the Tor ControlPort if you want to programmatically refresh the Tor session (i.e., get a new proxy IP address) without restarting your Tor client.

Configure tor by editing the torrc file usually located at **/etc/tor/torrc**, **/lib/etc/tor/torrc**, **~/.torrc** or **/usr/local/etc/tor/torrc** - Alternatively you can supply the path yourself with the **--default-torrc PATH** command line argument. See [Tor Command-Line Options](https://www.torproject.org/docs/tor-manual.html.en)

Generate the hash password for the torrc file by running **tor --hash-password SECRETPASSWORD**.

```bash
tor --hash-password giraffe
```

The last line of the output contains the hash password that you copy paste into torrc
```bash
Jul 21 13:08:50.363 [notice] Tor v0.2.6.10 (git-58c51dc6087b0936) running on Darwin with Libevent 2.0.22-stable, OpenSSL 1.0.2h and Zlib 1.2.5.
Jul 21 13:08:50.363 [notice] Tor can't help you if you use it wrong! Learn how to be safe at https://www.torproject.org/download/download#warning
16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF
```

Copy the generated hash password and add it to your torrc file
```bash
# sample torrc file
ControlPort 9051
HashedControlPassword 16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF
```

Lastly tell tor-request the password to use
```
var tr = require('tor-request')
tr.TorControlPort.password = 'giraffe'
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
