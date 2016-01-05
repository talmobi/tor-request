var libs = {
  // communicate with SOCKS (protocol used by tor) over nodejs
  Socks: require('socks'),

  // simplified http client for nodejs
  // (automatically follows 302 MOVED etc)
  request: require('request'),
};

/* Run tor locally (debian example: apt-get install tor)
 * default tor ip address: localhost
 * default tor port: 9050
 *
 * links: https://www.torproject.org/docs/tor-doc-unix.html
 * */

function createProxySettings (ipaddress, port, type) {
  var dps = default_proxy_settings || {};
  var proxy_setup = {
    ipaddress: ipaddress || dps.ipaddress || "localhost", // tor address
    port: port || dps.port || 9050, // tor port
    type: type || dps.type || 5,
  };
  return proxy_setup;
};

// set default proxy settings
var default_proxy_settings = createProxySettings("localhost", 9050);

/* helper function to create a SOCKS agent to be used in the request library
 * */
function createAgent (url) {
  var proxy_setup = createProxySettings();

  var isHttps = url.indexOf('https://') >= 0;

  var socksAgent = new libs.Socks.Agent({
      proxy: proxy_setup,
    },
    isHttps, // https
    false // rejectUnauthorized option passed to tls.connect().
  );

  return socksAgent;
};

/* wraps around libs.request and attaches a SOCKS Agent into
 * the request.
 * */
function torRequest (url, done) {
  var opts = {};

  if (typeof url === 'string') {
    opts = {
      url: url,
      method: 'GET', // default 
      agent: createAgent(url)
    };
  } else {
    opts = url;
    opts.agent = opts.agent || createAgent(opts.url);
  }

  return libs.request(opts, function (err, res, body) {
    // Connection header by default is keep-alive,
    // we have to manually end the socket
    var agent = opts.agent;
    if (agent && agent.encryptedSocket) {
      agent.encryptedSocket.end();
    }

    done(err, res, body);
  });
};


/*
 * Used to signal the Tor process, listening on contrl port 9051
 * by default, by running a child process. Constructing the signal
 * using echo and sending it to the control port by
 * piping it through net-cat (nc).
 * */
var exec = require('child_process').exec;

/*
 * Requires net-cat to be installed (debian guide: apt-get install net-cat)
 *
 * Sends a NEWNYM SIGNAL to Tor through the ControlPort.
 * Essentially getting a clean new tor session (and IP).
 *
 * NOTE: This is usually rate limited so use wisely!!
 *
 * You need to enabled the tor ControlPort:9051
 * and set a tor hash password by editing the /etc/tor/torrc file.
 *
 * Basic Guide:
 *  - ControlPort
 *      This will make Tor listen at a specified port so that we
 *      can send signals to it in order to manage it
 *      (such as shutdown, restart etc).
 *
 *      Enable the control port by uncommenting the line. 
 *
 *      #ControlPort 9051
 *
 *      inside /etc/tor/torrc
 *
 *  - set tor hash password
 *      first run
 *
 *      tor --hash-password ''
 *
 *      in the terminal. This outputs a hashpassword something like
 *
 *      16:D14CC89AD7848B8C60093105E8284A2D3AB2CF3C20D95FECA0848CFAD2
 *   
 *      now inside /etc/tor/torrc update the line
 *
 *      HashedControlPassword 16:D14CC89AD7848B8C60093105E8284A2D3AB2CF3C20D95FECA0848CFAD2
 *
 *      with your newly generated hash password. Then restart Tor
 *
 *      service tor restart
 * */
function renewTorSession (done) {
  var commandString = '(echo authenticate ""; echo signal newnym; echo quit) | nc localhost 9051';
  var child = exec( commandString
      , function (err, stdout, stderr) {
        if (err) {
          done(err);
        } else {
          done(null, "Success!");
        }
      });
}


module.exports = {
  setTorAddress: function (ipaddress, port) {
    // update the default proxy settings
    default_proxy_settings = createProxySettings(ipaddress, port);
  },

  request: torRequest,
  torRequest: torRequest,
  proxyRequest: torRequest,

  getNewIP: renewTorSession,
  newTorSession: renewTorSession,
  renewTorSession: renewTorSession,
};
