/*
Copyright (c) 2014-2018, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

'use strict'

const { Transform } = require('readable-stream')
const { StringDecoder } = require('string_decoder')
const _ = require('lodash');

const matcher = /\r?\n/;

function transform (chunk, enc, cb) {
  let currentIndex = 0;
  let isGMCP = false;
  let newLineIndex = chunk.indexOf(0x0A, currentIndex);
  while (newLineIndex >= 0) {
    if (chunk[currentIndex] === 0xFF) {
      //is GMCP
      isGMCP = true;
    } else {
      isGMCP = false;
    }
    //console.log('line', chunk.slice(currentIndex, newLineIndex).toString());
    let line = new Line({
      isGMCP: isGMCP,
      value: Buffer.from(chunk.slice(currentIndex, newLineIndex))
    });
    this.push(line);
    currentIndex = newLineIndex + 1;
    newLineIndex = chunk.indexOf(0x0A, currentIndex);
  }
  //send remainder
  if (chunk.length > currentIndex) {
    let line = new Line({
      isGMCP: isGMCP,
      isRemainder: true,
      value: Buffer.from(chunk.slice(currentIndex, chunk.length))
    });
    this.push(line);
  }
  cb();
}

function Line (args) {
  this.value = args.value;
  this.isGMCP = args.isGMCP;
  this.isRemainder = args.isRemainder ? true : false;
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