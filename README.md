# tor-request - Simple HTTP client through Tor network

## Simple to use
```js
var tr = require('tor-request');
tr.request('https://api.ipify.org', function (err, res, body) {
  if (!err && res.statusCode == 200) {
    console.log("Your public (through Tor) IP is: " + body);
  }
});

## About
A very simple and light wrapper around the fantastic [request](https://github.com/request/request) library to send the requests thourgh Tor. This is done by feeding configured SocksAgent to the request options.

## Requirements
tor-request by default uses the default Tor service running on your system. By default Tor runs on port 9050 (localhost of course). See [TorProject.org](https://www.torproject.org/docs/debian.html.en) for details.

On Debian you can install and run a relatively up to date Tor with

```bash
apt-get install tor

You need to have Tor installed on your system or set the ip address and port of a public Tor server by running the command.

```js
tr.setTorAddress(ipaddress, port); // "localhost" and 9050 by default
