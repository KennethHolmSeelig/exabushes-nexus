var net = require('net');
const split = require('./split');
const promptFilter = require('./prompt-filter')
const fs = require('fs');
const path = require('path');
const through2 = require('through2');

const HOME = __dirname + '/../home';

var net = require('net');

module.exports = function (args) {
    var client = new net.Socket();
    client.connect(3011, 'mud.genesismud.org', function() {
        console.log('Connected');
    });
    
    client.on('data', function(data) {
        //console.log('Received: ' + data);
        // do something with bindata
        //client.write(Buffer.from('FF0FD0C9')); // kill client after server's response
        //client.destroy();
    });
    
    let logPath = path.resolve(args.homeDir, 'global.log');
    
    let globalStream = fs.createWriteStream(logPath);
    client.pipe(globalStream);
    client
    .pipe(split())
    .pipe(promptFilter())
    .pipe(through2.obj(function (line, encoding, cb) {
      if (line.isRemainder === true || line.isGMCP === true) {
        this.push(line.value);
      } else {
        this.push(line.value + '\n');
      }
      cb();
    }))
    .pipe(args.socket)
    .on('data', function (line) {
        //console.log('line');
    });
    
    client.on('close', function() {
        console.log('Connection closed');
    });
    
    args.socket.pipe(client);
};