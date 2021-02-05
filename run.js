var net = require('net');
var Genesis = require('./lib/genesis');


const fs = require('fs');
const through2 = require('through2');
const path = require('path');
var bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'genesis',
  level: 'debug'
});

var gen = new Genesis({
  homeDir: __dirname + '/home',
  username: 'lokthar',
  password: 'Fa2ME,.nE@',
  out: process.stdout,
  in: through2(),
  logger: logger
});
gen.init();