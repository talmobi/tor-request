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
A very simple and light wrapper around the fantastic [request](https://github.com/request/request) library to send requests through Tor.

## How
Creates and configures appropriate Agent objects for the Node's http and https core libraries.

## Requirements
A Tor client.

Either run it yourself (apt-get install tor) or a remote one. Defaults to localhost on port 9050 (Tor's default port).

See [TorProject.org](https://www.torproject.org/docs/debian.html.en) for details and install guide for different systems.

On Debian you can install and run a relatively up to date Tor with.

```bash
apt-get install tor # should auto run as daemon after install
```

On OSX you can install with homebrew

```bash
brew install tor
tor & # run as background process
```

Configure the Tor address before making requests (or use the default).

```js
tr.setTorAddress(ipaddress, port); // "localhost" and 9050 by default
```

## API

```js
// index.js
module.exports = {
  /**
   * This is a simple wrapper function around the request library's request function.
   * Use it as you would use the request library. (see their superb documentation)
   *
   * See [request](https://github.com/request/request)
   * url: https://github.com/request/request
   */
  request: function (url || opts, function (err, res, body))
  
  /**
   * @param {string} ipaddress - ip address of tor server (localhost by default)
   * @param {number} port - port of the tor server (by default tor runs on port 9050)
   */
  setTorAddress: function (ipaddress, port) // defaults to localhost, 9050
  // If you run your Tor on a different port or you want to connect to a publicly avilable remote Tor server.
  
  /**
   * @param {function} done - the callback function to tell you when the process is done
   * @param {object} err - null if tor session renewed successfully
   */
  newTorSession: function ( done(err) ) // clears and renews the Tor session (i.e., you get a new IP)
  // NOTE: This is usually rate limited - so use wisely.
  // NOTE2: This is done by signaling the Tor service by on the control port (9051 by default).
  // This is done by executing a child process in node using echo and nc (net-cat). You need
  // to have enabled the control port and set up a tor password. This can all be done by editing two lines
  // of code in your /etc/tor/torrc file.
  // First uncomment the line "#ControlPort 9051"
  // Then generate a hash password by running the command "tor --hash-password '' | tail -n". Now replace the old password
  // on the line "HashedControlPassword 16:D14CC.......FAD2" with your new password.
  // This will allow you to access/modify/communicate with your tor client through a local port.
  // We will use this port and send a command with echo and nc (apt-get install netcat) to signal
  // a request for a new tor session. Alternatively you can kill and restart the process which will also
  // get you a new tor session (and ip).
  // Rememeber to restart Tor with "service tor restart"
}
```

## Test

Tests the original request library by connecting to http://api.ipify.org - returning your ip. Then makes a few additional requests, now through tor-request, and makes sure the ip's are different (went through tor).

```js
mocha test/test.js
```
