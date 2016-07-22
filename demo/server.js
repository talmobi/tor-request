var express = require('express')
var app = express()

var request = require('request')
var tr = require('../index.js')

var ipservices = [
  'http://icanhazip.com',
  'http://ifconfig.me/ip',
  'http://ifconfig.me',
  'https://api.ipify.org',
  'http://ip.appspot.com',
  'http://ip-spot.com',
]

function findExternalIp (request, done) {
  var iterator = 0
  function tick () {
    console.log('ticking')
    url = ipservices[iterator++]
    if (!url) return done(null)

    request(url, function (err_, req_, body) {
      if (err_) {
        console.log(err_)
        tick()
      } else {
        console.log(body)
        done(body)
      }
    })
  }
  tick()
}

var limiter = require('express-rate-limit')({
  windowMs: 1000 * 60 * 15, // 15 min
  max: 200,
  delayMs: 0
})

var renewTorSessionTimeout = 1000 * 30 // 30 second timeout on session renew
var renewTorSessionTime = Date.now() - renewTorSessionTimeout

app.use(limiter)
app.use(express.static('public'))

app.use(function (req, res, next) {
  console.log(req.originalUrl)
  next()
})

app.get('/api/myip', function (req, res) {
  res.send(req.ip)
})

app.get('/api/serverip', function (req, res) {
  findExternalIp(request, function (ip) {
    res.send(ip)
  })
})

app.get('/api/mytorip', function (req, res) {
  findExternalIp(tr.request, function (ip) {
    res.send(ip)
  })
})

app.get('/api/requestNewTorSession', function (req, res) {
  var now = Date.now()
  var delta = now - renewTorSessionTime
  if (delta > renewTorSessionTimeout) {
    renewTorSessionTime = now

    tr.renewTorSession(function (err, success) {
      if (err) return res.status(500).send({
        statusCode: 500,
        message: 'error - could not renew tor session'
      })
      res.status(200).send({
        statusCode: 200,
        message: 'success'
      })
    })
  } else {
    var s = (delta / 1000) | 0
    res.status(400).send({
      statusCode: 400,
      message: 'too frequest session renews, try again in ' + s + ' seconds'
    })
  }
})

var port = 3366
var server = require('http').createServer(app)
server.listen(port, function () {
  console.log('server listneing on port *:' + port)
})
