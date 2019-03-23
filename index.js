var libs = {
  // communicate with SOCKS (protocol used by tor) over nodejs
  SocksProxyAgent: require( 'socks-proxy-agent' ),

  // better HTTP for nodejs
  request: require( 'request' )
}

/* Run tor locally (debian example: apt-get install tor)
 * default tor ip address: localhost
 * default tor port: 9050
 *
 * links: https://www.torproject.org/docs/tor-doc-unix.html
 * */

function createProxySettings ( ipaddress, port, type )
{
  var dps = _defaultProxySettings || {}
  var proxySetup = {
    ipaddress: ipaddress || dps.ipaddress || '127.0.0.1', // tor address
    port: port || dps.port || 9050, // tor port
    type: type || dps.type || 5
  }

  // common usage
  if ( proxySetup.ipaddress === 'localhost' ) {
    proxySetup.ipaddress = '127.0.0.1'
  }

  return proxySetup
}

function attachCommonErrorDetails ( err )
{
  // https://github.com/talmobi/tor-request/issues/3
  // https://github.com/talmobi/tor-request/issues/11
  // https://github.com/talmobi/tor-request/issues/20
  // https://github.com/talmobi/tor-request/issues/5

  if ( !err ) return
  if ( typeof err.message !== 'string' ) return

  if (
    ( err.message.indexOf( 'ECONNREFUSED' ) >= 0 ) ||
    ( err.message.toLowerCase() === 'socket closed' )
  ) {
    var attachment = (
      '\n - Are you running `tor`?' +
      '\nSee easy guide here (OSX, Linux, Windows):' +
      '\nhttps://github.com/talmobi/tor-request#requirements' +
      '\n\n Quickfixes:' +
      '\n  OSX: `brew install tor && tor`         # installs and runs tor' +
      '\n  Debian/Ubuntu: `apt-get install tor`   # should auto run as daemon after install' +
      '\n'
    )

    // only attach once
    if ( err.message.indexOf( attachment ) === -1 ) {
      err.message = (
        err.message + attachment
      )
    }
  }
}

function attachCommonControlPortErrorDetails ( err )
{
  // https://github.com/talmobi/tor-request/issues/1

  if ( !err ) return
  if ( typeof err.message !== 'string' ) return

  // if ( err.code === 'ECONNREFUSED' ) {
  if ( err ) {
    var attachment = (
      ' - Have you enabled the ControlPort in your `torrc` file? (' + getTorrcLocation() + ')' +
      '\n\nSee easy guide here (OSX, Linux, Windows):' +
      '\nhttps://github.com/talmobi/tor-request#optional-configuring-tor-enabling-the-controlport' +
      '\n\n Sample torrc file:' +
      '\n     ControlPort 9051' +
      '\n     HashedControlPassword 16:AEBC98A67.....E81DF' +
      '\n' +
      '\n   Generate HashedControlPassword with (last output line):' +
      '\n     `tor --hash-password my_secret_password`' +
      '\n' +
      '\n   Tell tor-request the password to use:' +
      '\n     `require( "tor-request" ).TorControlPort.password = "my_secret_password"`' +
      '\n' +
      '\n'
    )

    // only attach once
    if ( err.message.indexOf( attachment ) === -1 ) {
      err.message = (
        err.message + attachment
      )
    }
  }
}

function getTorrcLocation ()
{
  var _fs = require( 'fs' )
  var _path = require( 'path' )

  var suffixes = [
    '',
    '.sample'
  ]

  var paths = [
    '/usr/local/etc/tor/torrc',
    '/tor/etc/tor/torrc',
    '/etc/tor/torrc',
    '/lib/etc/tor/torrc',
    '~/.torrc',
    '~/Library/Application Support/TorBrowser-Data/torrc',
  ]

  for ( var i = 0; i < paths.length; i++ ) {
    for ( var j = 0; j < suffixes.length; j++ ) {
      var p = _path.resolve(
        ( paths[ i ] + suffixes[ j ] )
        .split( '~' ).join( require( 'os' ).homedir() )
      )

      try {
        var exists = _fs.existsSync( p )
        if ( exists ) {
          return paths[ i ] + ' ?'
        }
      } catch ( err ) {
        /* ignore */
      }
    }
  }

  return 'torrc not found, specify with `tor --default-torrc <PATH>`'
}

// set default proxy settings
var _defaultProxySettings = createProxySettings( 'localhost', 9050 )

/* helper function to create a SOCKS agent to be used in the request library
 * */
function createAgent ( url )
{
  var ps = createProxySettings()

  var protocol = 'socks://'

  switch ( String( ps.type ) ) {
    case '4':
      protocol = 'socks4://'
      break

    default:
      protocol = 'socks://' // defaults to v5
  }

  var proxyUri = protocol + ps.ipaddress + ':' + ps.port

  // other available protocols, see: https://www.npmjs.com/package/proxy-agent
  // http             http://
  // https            https://
  // socks(v5)        socks://
  // socks5           socks5://
  // socks4           socks4://
  // pac              pac+http://

  var socksAgent = libs.SocksProxyAgent(
    proxyUri
  )

  return socksAgent
}

/* wraps around libs.request and attaches a SOCKS Agent into
 * the request.
 * */
function torRequest ( uri, options, callback )
{
  var params = libs.request.initParams( uri, options, callback )

  params.agent = createAgent( params.uri || params.url )

  return libs.request( params, function ( err, res, body ) {
    // Connection header by default is keep-alive,
    // we have to manually end the socket
    var agent = params.agent
    if ( agent && agent.encryptedSocket ) {
      agent.encryptedSocket.end()
    }

    // detect common error where tor is not installed or running
    attachCommonErrorDetails( err )

    if ( params.callback ) params.callback( err, res, body )
  } )
}

// bind http through tor-request instead of request
function verbFunc ( verb )
{
  var method = verb === 'del' ? 'DELETE' : verb.toUpperCase()
  return function ( uri, options, callback ) {
    var params = libs.request.initParams( uri, options, callback )
    params.method = method
    return torRequest( params, params.callback )
  }
}

// create bindings through tor-request for http
torRequest.get = verbFunc( 'get' )
torRequest.head = verbFunc( 'head' )
torRequest.post = verbFunc( 'post' )
torRequest.put = verbFunc( 'put' )
torRequest.patch = verbFunc( 'patch' )
torRequest.del = verbFunc( 'del' )

torRequest.jar = libs.request.jar
torRequest.cookie = libs.request.cookie
torRequest.defaults = function () {
  var lib = require( 'request' )
  libs.request = lib.defaults.apply( lib, arguments )
  libs.request.initParams = lib.initParams
  return torRequest
}

var net = require( 'net' ) // to communicate with the Tor clients ControlPort
var os = require( 'os' ) // for os EOL character

// helper object for communicating with the Tor ControlPort.
// With the ControlPort we can request the Tor Client to renew out session (get new ip)
// Make sure to enable the tor ControlPort and set a password for authentication by
// running "tor --hash-password YOUR_PASSWORD_HERE"
// altogether editing two lines in your /etc/tor/torrc file.
var TorControlPort = {
  password: '', // password for ControlPort
  host: 'localhost',
  port: 9051,

  /**
   * @param {Array.<string>} commands - array of commands to send to the ControlPort
   * @param {function} done - callback function (err, data). err is null on success.
   * */
  send: function send ( commands, done ) {
    var socket = net.connect( {
      host: TorControlPort.host || 'localhost',
      port: TorControlPort.port || 9051 // default Tor ControlPort
    }, function () {
      var commandString = commands.join( '\n' ) + '\n'
      socket.write( commandString )
    } )

    socket.on( 'error', function ( err ) {
      attachCommonControlPortErrorDetails( err )

      done( err || 'ControlPort communication error' )
    } )

    var data = ''
    socket.on( 'data', function ( chunk ) {
      data += chunk.toString()
    } )

    socket.on( 'end', function () {
      done( null, data )
    } )
  }
}

/**
 * send a predefined set of commands to the ControlPort
 * to request a new tor session.
 */
function renewTorSession ( done )
{
  var password = TorControlPort.password || ''
  var commands = [
    'authenticate "' + password + '"', // authenticate the connection
    'signal newnym', // send the signal (renew Tor session)
    'quit' // close the connection
  ]

  TorControlPort.send( commands, function ( err, data ) {
    if ( err ) {
      attachCommonControlPortErrorDetails( err )
      done( err )
    } else {
      var lines = data.split( os.EOL ).slice( 0, -1 )

      var success = lines.every( function ( val, ind, arr ) {
        // each response from the ControlPort should start with 250 (OK STATUS)
        return val.length <= 0 || val.indexOf( '250' ) >= 0
      } )

      if ( !success ) {
        var err = new Error( 'Error communicating with Tor ControlPort\n' + data )
        attachCommonControlPortErrorDetails( err )
        done( err )
      } else {
        done( null, 'Tor session successfully renewed!!' )
      }
    }
  } )
}

const api = {
  setTorAddress: function ( ipaddress, port, type ) {
    // update the default proxy settings
    _defaultProxySettings = createProxySettings( ipaddress, port, type )
    api.proxySettings = _defaultProxySettings
  },

  proxySettings: _defaultProxySettings,

  request: torRequest,
  torRequest: torRequest,

  newTorSession: renewTorSession,
  renewTorSession: renewTorSession,

  TorControlPort: TorControlPort
}

module.exports = api
