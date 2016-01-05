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

## About
A very simple and light wrapper around the fantastic [request](https://github.com/request/request) library to send requests through Tor. This is done by feeding configured SocksAgent to the request options.

## Requirements
tor-request by default uses the Tor service running on your system (localhost). By default Tor runs on port 9050 (localhost of course). See [TorProject.org](https://www.torproject.org/docs/debian.html.en) for details.

On Debian you can install and run a relatively up to date Tor with

```bash
apt-get install tor
```

You need to have Tor installed on your system or set the ip address and port of a public Tor server by running the command.

```js
tr.setTorAddress(ipaddress, port); // "localhost" and 9050 by default
```

## API

```js
// index.js
module.exports = {
  /**
   * See [request](https://github.com/request/request)
   * url: https://github.com/request/request
   */
  request: function (err, res, body)
  
  /**
   * @param {string} ipaddress - ip address of tor server (if running locally it's 127.0.0.1 i.e. localhost)
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
  // Then generate a hash password by running the command "tor --hash-password ''". Now replace the old password
  // on the line "HashedControlPassword 16:D14CC.......FAD2" with your new password.
  // Rememeber to restart Tor with "service tor restart"
}
```

## Test

This tests by running 3 requests to api.ipify.org which returns your ip address in the response body.
The first one is a vanilla request that should give you your normal public IP.
The second if a request through Tor.
The third is another request through Tor after a renewed Tor Session.
All three requests should console.log different IP:s. If not, the test fails.

```js
node test/test.js
```
