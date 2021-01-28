const bunyan = require('bunyan');
var log_level = 'info';
const path = require('path');
const through2 = require('through2');
var fs = require('fs');
const test_dir = __dirname + '/../test-data';
const prompt = require(__dirname + '/../lib/prompt');
const split = require(__dirname + '/../lib/split');

/* global global_logger */
global.global_logger = bunyan.createLogger({ name: 'exabushes-nexus', level: log_level });

const assert = require('chai').assert;

describe('prompt-filter', function () {
  it('should remove Prompt', function () {
    var cleaned = promptFilter.removePrompt(Buffer.from('3e20fff9596f7572206d61676963206d617020626567696e7320746f20676c6f772e0d', 'hex'));
    assert.equal(cleaned.toString(), 'Your magic map begins to glow.\r');
  });

  it.only('should remove Prompt from Text output', function (done) {
    var input = fs.createReadStream(path.resolve(test_dir, 'remove-prompt.log'));
    var lines = [];
    var stream = input.pipe(split())
    .pipe(prompt.filter())
    .pipe(through2(function (line, encoding, cb) {
      lines.push(line)
      cb();
    }));
    
    stream.on('finish', function () {
      try {
        assert.equal(lines.length, 58);
      } catch(e) {
        return done(e);
      }
      done();
    });
  });
});