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

describe('split', function () {
  it('should split lines', function (done) {
    var input = fs.createReadStream(path.resolve(test_dir, '../home/raw.log'));
    let lines = [];
    
    var stream = input.pipe(split())
    .pipe(through2.obj(function (line, encoding, cb) {
      console.log(line.toString('hex'));
      process.stdout.write(line.toString() + '\n');
      lines.push(line);
      cb();
    }));
    
    stream.on('finish', function () {
      try {
        assert.equal(lines.length, 29);
      } catch(e) {
        return done(e);
      }
      done();
    });
  });
});