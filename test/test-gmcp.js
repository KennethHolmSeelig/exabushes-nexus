const bunyan = require('bunyan');
var log_level = 'info';
const path = require('path');
const through2 = require('through2');
var fs = require('fs');
const test_dir = __dirname + '/../test-data';
const _ = require('lodash');
/* global global_logger */
global.global_logger = bunyan.createLogger({ name: 'exabushes-nexus', level: log_level });

const assert = require('chai').assert;
const gmcp = require('../lib/gmcp');
const split = require('../lib/split');

describe('gmcp', function () {
  it('should extract GMCP from buffer', function () {
    var tuple;

    tuple = gmcp.extract(Buffer.from('fffbc9fffb460d', 'hex'));
    
    assert.equal(tuple.gmcp.length, 2);
    assert.equal(tuple.gmcp[0].raw.toString(), Buffer.from('fffbc9f', 'hex').toString());
    assert.equal(tuple.gmcp[1].raw.toString(), Buffer.from('fffb46', 'hex').toString());
    assert.equal(tuple.text.toString(), '\r');

    let multipleGmcpLine = Buffer.from('fffac9636861722e6c6f67696e207b2022756964223a202254774158325c2f222c20226e616d65223a20226c6f6b7468617222207dfff0fffac9636f72652e70696e672030fff03e20fff9596f7572206d61676963206d617020626567696e7320746f20676c6f772e0d', 'hex');

    tuple = gmcp.extract(multipleGmcpLine);
    assert.equal(tuple.gmcp[0].out, 'IAC SB GMCP char.login { "uid": "TwAX2\\/", "name": "lokthar" } IAC SE');
    assert.equal(tuple.gmcp[1].out, 'IAC SB GMCP core.ping 0 IAC SE');
    assert.equal(tuple.gmcp[2].out, 'IAC Data Mark');

    assert.equal(tuple.gmcp.length, 3);
    
    assert.equal(tuple.gmcp[0].raw, Buffer.from('fffac9636861722e6c6f67696e207b2022756964223a202254774158325c2f222c20226e616d65223a20226c6f6b7468617222207dfff0', 'hex').toString());
    assert.equal(tuple.gmcp[1].raw, Buffer.from('fffac9636f72652e70696e672030fff0', 'hex').toString());
    assert.equal(tuple.gmcp[2].raw, Buffer.from('fff9', 'hex').toString());
    
    assert.equal(tuple.text.toString(), 'Your magic map begins to glow.\r');
  });

  it.only('should split GMCP from Text output', function (done) {
    var input = fs.createReadStream(path.resolve(test_dir, 'gmcp.log'));
    var gmcpLog = [];
    var socketData = [];
    var stream = input.pipe(split())
    .pipe(gmcp.filter({
      socket: {
        push: function (data) {
          socketData.push(data);
        }
      },
      log: {
        write: function (gmcp) {
          _.each(gmcp, function(entry) {
            //console.log(entry.out);
          });
          gmcpLog.push(gmcp);
        }
      },
      debug: true
    }));
    
    stream.pipe(through2(function (line, encoding, cb) {
      //console.log(line.toString('hex'));
      process.stdout.write(line.toString() + '\n');
      cb();
    }));
    
    stream.on('finish', function () {
      try {
        assert.equal(gmcpLog.length, 16);
      } catch(e) {
        return done(e);
      }
      done();
    });
  });
});