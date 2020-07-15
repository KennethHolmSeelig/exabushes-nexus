var net = require('net');
var split = require('./split');
var client = require('./client');
const fs = require('fs');
const path = require('path');

let HOME = __dirname + '/../home';
if (process.argv[2] === '--home') {
  HOME = process.argv[3];
}

var net = require('net');

var server = net.createServer(function(socket) {
  client({
    homeDir: HOME,
    socket: socket
  });
});

server.listen(8080, '127.0.0.1');
