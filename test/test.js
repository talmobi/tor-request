var tr = require('../index.js');
var request = require('request');

var chalk = require('chalk');

var url = "https://api.ipify.org"; // get your public ip as response

var ip = "";

request(url, function (err, res, body) {
  process.stdout.write("Connecting to: " + url);

  if (err) {
    console.log(chalk.red(" Failed."));
    console.log(err);
  } else {
    console.log(chalk.green(" Success!"));
    console.log("public    ip: " + body);
    ip = body;

    process.stdout.write("Testing Tor Proxy... ");
    tr.request( url, testProxy );
  }
});

function testProxy (err, res, body) {
  if (err) {
    console.log(err);
  } else {
    if (ip != body) {
      console.log(chalk.green("Success!"));
    } else {
      console.log(chalk.red("Failed."));
    }

    console.log("proxy     ip: " + body);
    ip = body;

    process.stdout.write("Testing New Tor Session... ");
    tr.newTorSession(function (err) {
      if (err) {
        console.log(" Failed. Error occured.");
      } else {
        tr.request( url, testNewTorSession );
      }
    });
  }
};

function testNewTorSession (err, res, body) {
  if (err) {
    console.log(err);
  } else {
    if (ip != body) {
      console.log(chalk.green("Success!"));
    } else {
      console.log(chalk.red("Failed."));
    }

    console.log("new proxy ip: " + body);
    ip = body;

    console.log();
    console.log(chalk.green("All Tests Passed!"));
  }
};
