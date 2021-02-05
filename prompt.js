var readline = require('readline');
var through2 = require('through2');
var colors = require('colors/safe');
var net = require('net');
var bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'prompt',
  level: 'debug'
});

var main = { write: function () {} };

main = new net.Socket();main.connect(8080, '127.0.0.1', function() {});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});
rl.prompt();

readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', function (data, key) {
  var command;
  if (key.shift === true && key.meta === true) {
    if (key.name === 'w') {
      command = 'north';
    } else if (key.name === 's') {
      command = 'south';
    } else if (key.name === 'a') {
      command = 'west';
    } else if (key.name === 'd') {
      command = 'east';
    } else if (key.name === 'r') {
      command = 'up';
    } else if (key.name === 'f') {
      command = 'down';
    } else if (key.name === 'x') {
      command = 'exa map';
    } else if (key.name === 'z') {
      command = 'look';
    }
  }
  if (command) {
    //readline.clearLine(process.stdin, -1);
    //console.log(rl.line, rl.cursor);
    main.write(command + '\n');
    console.log(colors.cyan('do') + ' ' + command);
  }
});

rl.on('line', function (input) {
  console.log(colors.cyan('echo: ') + input);
  
  if (input === 'exit') {
    main.destroy();
    rl.close();
  } else {
    let flushed = main.write(input + '\n');
    rl.prompt();
  }
});