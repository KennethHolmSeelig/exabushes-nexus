'use strict'

const { Transform } = require('readable-stream')
const _ = require('lodash');

function getNextNewLineIndex(chunk, currentIndex) {
  return chunk.indexOf(0x0A, currentIndex);
}

function transform (chunk, enc, cb) {
  let currentIndex = 0;

  let newLineIndex = getNextNewLineIndex(chunk, currentIndex);
  
  while (newLineIndex >= 0) {
    this.push(Buffer.from(chunk.slice(currentIndex, newLineIndex)));
    currentIndex = newLineIndex + 1;
    newLineIndex = getNextNewLineIndex(chunk, currentIndex);
  }
  //send remainder
  if (chunk.length > currentIndex) {
    this.push(Buffer.from(chunk.slice(currentIndex, chunk.length)));
  }
  cb();
}

function flush (cb) {
  // forward any gibberish left in there
  //TODO remained
  cb();
}

function split () {
  let options = Object.assign({});
  options.transform = transform;
  options.flush = flush;
  options.readableObjectMode = true;
  return new Transform(options);
}

module.exports = split;