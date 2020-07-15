const bunyan = require('bunyan');
var log_level = 'info';
const path = require('path');
const through2 = require('through2');
var fs = require('fs');
const test_dir = __dirname + '/../test-data';
/* global global_logger */
global.global_logger = bunyan.createLogger({ name: 'exabushes-nexus', level: log_level });

const assert = require('chai').assert;
const split = require('../lib/split');

describe('split', () => {
  it('should split GMCP from Text output', (done) => {
    var input = fs.createReadStream(path.resolve(test_dir, 'split-gmcp.log'));
    let gmcpLines = [];
    let nonGmcpLines = [];
    let remainderLines = [];
    var stream = input.pipe(split())
    .pipe(through2.obj((line, encoding, cb) => {
      if (line.isGMCP) {
        gmcpLines.push(line);
      } else {
        nonGmcpLines.push(line);
      }
      if (line.isRemainder == true) {
        remainderLines.push(line);
      }
      cb();
    }));
    
    stream.on('finish', () => {
      try {
        assert.equal(gmcpLines.length, 1);
        assert.equal(nonGmcpLines.length, 26);
        assert.equal(remainderLines.length, 1);
        assert.equal(remainderLines[0].value.toString(), "Please enter your name or type 'new' to create a new character: ");
      } catch(e) {
        return done(e);
      }
      done();
    });
  });
});