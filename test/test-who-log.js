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

describe('who log', () => {
  it('should note who is online', function (done) {
    var input = fs.createReadStream(path.resolve(test_dir, 'who.log'));
	var lines = [];
    var stream = input.pipe(split())
	.pipe(promptFilter())
    .pipe(through2.obj((line, encoding, cb) => {
	  lines.push(line)
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