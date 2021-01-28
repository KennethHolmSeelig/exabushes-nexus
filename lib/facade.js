var net = require('net');
const split = require('./split');
const prompt = require('./prompt')
const fs = require('fs');
const path = require('path');
const through2 = require('through2');
const gmcp = require('./gmcp');

var net = require('net');

module.exports = function (args) {
    var main = new net.Socket();
    main.connect(3011, 'mud.genesismud.org', function() {
        console.log('Connected');
    });
    
    let rawLogPath = path.resolve(args.homeDir, 'raw.log');
    let textLogPath = path.resolve(args.homeDir, 'text.log');
    let gmcpLogPath = path.resolve(args.homeDir, 'gmcp.log');
    
    let rawLogStream = fs.createWriteStream(rawLogPath);
    let textLogStream = fs.createWriteStream(textLogPath);
    let gmcpLogStream = fs.createWriteStream(gmcpLogPath);
    main.pipe(rawLogStream);

    let initiated = false;
    main
    .pipe(split())
    .pipe(gmcp.filter({
      socket: main,
      log: gmcpLogStream
    }))
    .pipe(prompt.filter())
    .pipe(through2(function (data, encoding, cb) {
      if (initiated === false) {
        gmcp.ping({
          socket: main,
          log: gmcpLogStream
        });
        gmcp.set({
          socket: main,
          log: gmcpLogStream
        });
        initiated = true;
      }

      if (data.toString().indexOf('Please enter your name') === 0) {
        main.write('lokthar\n');
        main.write('Fa2ME,.nE@\n');
        /*gmcp.login({
          socket: main,
          log: gmcpLogStream
        });*/
      }
      let lineToWrite = data.toString();
      textLogStream.write(lineToWrite + '\n');
      this.push(lineToWrite);
      cb();
    }))

    .on('data', function (line) {
        console.log(line.toString());
    });
    
    main.on('close', function() {
        console.log('Connection closed');
        textLogStream.close();
        gmcpLogStream.close();
    });
    
    args.socket.pipe(main);
};