var tr = require('../index.js');
var request = require('request');

var chalk = require('chalk');

var url = "http://api.ipify.org"; // this api returns your ip in the respnose body
var httpsUrl = "https://api.ipify.org";

describe('Testing request and tor-request against ' + url, function () {
  this.timeout(15000);
  var public_ip = "";
  var tor_ip = "";

  describe('test http request', function () {
    it('should return without error', function (done) {
      request(url, function (err, res, body) {
        if (err) throw err;
        console.log("The requests public ip was: " + body);
        public_ip = body;
        done();
      });
    });
  });

  describe('test https (SSL) request. Should match last returned ip.', function () {
    it('should return without error', function (done) {
      request(httpsUrl, function (err, res, body) {
        if (err || body != public_ip) throw err;
        console.log("The requests public ip was: " + body);
        public_ip = body;
        done();
      });
    });
  });

  describe('test http tor-request', function () {
    it('should return without error', function (done) {
      tr.request(url, function (err, res, body) {
        if (err) throw err;
        console.log("The requests public ip was: " + body);
        tor_ip = body;
        done();
      });
    });
  });

  describe('request a new tor session with tr.newTorSession', function () {
    it('should return without error', function (done) {
      tr.newTorSession(function (err) {
        if (err) throw err;
        done();
      });
    });
  });

  describe('verify that we have a new tor sessoin (new ip)', function () {
    it('should return without error', function (done) {
      tr.request(url, function (err, res, body) {
        // api.ipify.org returns your ip in the response body
        if (err || body == tor_ip) throw err || new Error('ip has not changed after new tor session was requested.');
        console.log("The requests public ip was: " + body + " (last was: "+ tor_ip +")");
        tor_ip = body;
        done();
      });
    });
  });

});
