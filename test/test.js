var tr = require('../index.js');
var request = require('request');

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
        if (err || body == public_ip) throw err || new Error("request didn't go through tor - the tor ip and pulic ip were the same.");
        console.log("The requests public ip was: " + body);
        tor_ip = body;
        done();
      });
    });
  });

  /**
   * Test http bindings between request and tor-request
   */

  describe('test http bindings between tor-request and request', function () {

    describe('test http GET tor-request', function () {
      it('should return without error', function (done) {
        tr.request.get(url, function (err, res, body) {
          console.log("method was: " + res.req.method);
          if (err || res.req.method != 'GET') throw err || new Error("failed to call tr.request.get through tor");
          done();
        });
      });
    });

    describe('test http POST tor-request', function () {
      it('should return without error', function (done) {
        tr.request.post(url, function (err, res, body) {
          console.log("method was: " + res.req.method);
          if (err || res.req.method != 'POST') throw err || new Error("failed to call tr.request.post through tor");
          done();
        });
      });
    });

    describe('test http HEAD tor-request', function () {
      it('should return without error', function (done) {
        tr.request.head(url, function (err, res, body) {
          console.log("method was: " + res.req.method);
          if (err || res.req.method != 'HEAD') throw err || new Error("failed to call tr.request.head through tor");
          done();
        });
      });
    });

    describe('test http DELETE tor-request', function () {
      it('should return without error', function (done) {
        tr.request.del(url, function (err, res, body) {
          console.log("method was: " + res.req.method);
          if (err || res.req.method != 'DELETE') throw err || new Error("failed to call tr.request.del through tor");
          done();
        });
      });
    });

    describe('test http PUT tor-request', function () {
      it('should return without error', function (done) {
        tr.request.put(url, function (err, res, body) {
          console.log("method was: " + res.req.method);
          if (err || res.req.method != 'PUT') throw err || new Error("failed to call tr.request.put through tor");
          done();
        });
      });
    });

    describe('test params.url alias for params.uri', function () {
      it('should return without error', function (done) {
        tr.request.get({url: url}, function (err, res, body) {
          console.log("method was: " + res.req.method);
          if (err || res.req.method != 'GET') throw err || new Error("failed to call tr.request.put through tor");
          console.log("the requests public ip was: " + body);
          done();
        });
      });
    });

  })

});
