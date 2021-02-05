var net = require('net');
const split = require('./split');
const prompt = require('./prompt')
const fs = require('fs');
const path = require('path');
const through2 = require('through2');
const gmcp = require('./gmcp');

var net = require('net');

module.exports = Genesis;

function Genesis (args) {
  this.homeDir = args.homeDir;
  this.in = args.in;
  this.username = args.username;
  this.password = args.password;
  this.out = args.out;
  this.logger = args.logger;
}

Genesis.prototype.init = function () {
    var self = this;
    
    this.main = new net.Socket();
    this.main.connect(3011, 'mud.genesismud.org', function() {
        self.logger.info('Connected');
    });
    
    let rawLogPath = path.resolve(this.homeDir, 'raw.log');
    let textLogPath = path.resolve(this.homeDir, 'text.log');
    let gmcpLogPath = path.resolve(this.homeDir, 'gmcp.log');
    
    let rawLogStream = fs.createWriteStream(rawLogPath);
    let textLogStream = fs.createWriteStream(textLogPath);
    let gmcpLogStream = fs.createWriteStream(gmcpLogPath);
    this.main.pipe(rawLogStream);

    let initiated = false;
    this.main
    .pipe(split())
    .pipe(gmcp.filter({
      socket: self.main,
      log: gmcpLogStream
    }))
    .pipe(prompt.filter())
    .pipe(through2(function (data, encoding, cb) {
      if (initiated === false) {
        gmcp.ping({
          socket: self.main,
          log: gmcpLogStream
        });
        gmcp.set({
          socket: self.main,
          log: gmcpLogStream
        });
        initiated = true;
      }

      if (data.toString().indexOf('Please enter your name') === 0) {
        self.main.write(self.username + '\n');
        self.main.write(self.password + '\n');
        self.logger.info('Logged in');
      }
      let lineToWrite = data.toString();
      textLogStream.write(lineToWrite + '\n');
      this.push(lineToWrite);
      cb();
    }))

    .on('data', function (line) {
        self.out.write(line.toString() + '\n');
    });
    
    this.main.on('close', function() {
        self.logger.info('Connection closed');
        textLogStream.close();
        gmcpLogStream.close();
    });
    
    this.main.on('error', function (error) {
      logger.error({ err: error }, 'error on main socket');
    });
    this.in.pipe(this.main);
};