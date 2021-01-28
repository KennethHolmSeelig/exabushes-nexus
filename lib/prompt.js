const through2 = require('through2');

const prompt = 0x3E;
const IAC = 0xFF;

function removePrompt (buffer) {
  let promptIndex = buffer.indexOf(prompt);
  if (promptIndex === 0) {
    let iacIndex = buffer.indexOf(IAC, 0);
    if (iacIndex > -1) {
      return buffer.slice(iacIndex + 2, buffer.length);
    } else {
      return buffer.slice(2, buffer.length);
    }
  } else {
    return buffer;
  }
  cb();
}

module.exports = {
  filter: function () {
    return through2(function (line, encoding, cb) {
      this.push(removePrompt(line));
      cb();
    });
  },
  removePrompt: removePrompt
};