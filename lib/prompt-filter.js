const through2 = require('through2');

module.exports = function () {
  return through2.obj(function (line, encoding, cb) {
    if (line.value.indexOf('> ') !== 0) {
      this.push(line);
    }
    cb();
  });
};