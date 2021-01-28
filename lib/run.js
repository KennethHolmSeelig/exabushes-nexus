var net = require('net');
var split = require('./split');
var facade = require('./facade');
const fs = require('fs');
const through2 = require('through2');
const path = require('path');

const gmcp = require('./gmcp');
const prompt = require('./prompt');

let HOME = __dirname + '/../home';
var main = new net.Socket();
main.connect(3011, 'mud.genesismud.org', function() {
    console.log('Connected');
});
var once = false;

let gmcpLogPath = path.resolve(HOME, 'gmcp.log');
let rawLogPath = path.resolve(HOME, 'raw.log');
let rawLogStream = fs.createWriteStream(rawLogPath);
let gmcpLogStream = fs.createWriteStream(gmcpLogPath);

const IAC_WILL_GMCP = Buffer.from([0xFF, 0xFB, 0xC9]);
const IAC_WILL_MSSP = Buffer.from([0xFF, 0xFB, 0x46]);
const IAC_DO_GMCP = Buffer.from([0xFF, 0xFD, 0xC9]);
const IAC_DO_MSSP = Buffer.from([0xFF, 0xFD, 0xC9]);

const IAC_SB_GMCP = Buffer.from([0xFF, 0xFA, 0xC9]);
const IAC_SE = Buffer.from([0xFF, 0xF0]);
const SB   = 0xFA;
const IAC  = 0xFF
const SE   = 0XF0;

var initiated = false;
main.pipe(rawLogStream);
main.pipe(split())
.pipe(gmcp.filter({
  socket: through2(),
  log: gmcpLogStream
}))
.pipe(prompt.filter())
.pipe(through2(function (data, enc, cb) {
  process.stdout.write(data.toString() + '\n');
  
  if (initiated === false) {
    main.write(IAC_DO_GMCP);
    initiated = true;
    main.write(IAC_SB_GMCP);
    main.write('Core.Ping');
    main.write(IAC_SE);
  }

  if (data.toString().indexOf('Please enter your name') === 0) {
    main.write('lokthar\n');
    main.write('Fa2ME,.nE@\n');
  }
  cb();
}));

main.on('data', function(data) {

    setTimeout(function () {
      main.destroy();
    }, 10000);
});