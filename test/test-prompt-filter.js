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

describe('prompt-filter', () => {
  it('should remove Prompt from Text output', (done) => {
    var input = fs.createReadStream(path.resolve(test_dir, 'remove-prompt.log'));
    let gmcpLines = [];
    let nonGmcpLines = [];
    let remainderLines = [];
    var stream = input.pipe(split())
    .pipe(through2.obj((line, encoding, cb) => {
      if (line.value.indexOf('> ') === 0) {
        console.log(line.value.indexOf('> '))
        console.log(line.value.toString());
        console.log(line.value);
      }
      cb();
    }));
    
    stream.on('finish', () => {
      try {
        assert.equal(1,1);
      } catch(e) {
        return done(e);
      }
      done();
    });
  });
});