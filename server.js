var net = require('net');
var bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'genesis',
  level: 'debug'
});

var Genesis = require('./lib/genesis');
const fs = require('fs');
const path = require('path');

let HOME = __dirname + '/home';
if (process.argv[2] === '--home') {
  HOME = process.argv[3];
}

var net = require('net');

var server = net.createServer(function(socket) {
  socket.on('data', function (data) {
    //console.log('the data' + data.toString());
  });
  var gen = new Genesis({
    homeDir: __dirname + '/home',
    username: 'lokthar',
    password: 'Fa2ME,.nE@',
    out: process.stdout,
    in: socket,
    logger: logger
  });
  gen.init();
});

server.listen(8080, '127.0.0.1');
