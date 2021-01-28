const through2 = require('through2');
const _ = require('lodash');

const IAC_WILL_GMCP = Buffer.from([0xFF, 0xFB, 0xC9]);
const IAC_WILL_MSSP = Buffer.from([0xFF, 0xFB, 0x46]);
const IAC_DO_GMCP = Buffer.from([0xFF, 0xFD, 0xC9]);

const IAC_SB_GMCP = Buffer.from([0xFF, 0xFA, 0xC9]);
const IAC_SE = Buffer.from([0xFF, 0xF0]);
const SB   = 0xFA;
const IAC  = 0xFF
const SE   = 0XF0;
const WILL = 0xFB;

const GMCP = 0xC9;
const MSSP = 0x46;

const DataMark = 0xF9;

function extract (buffer) {
  let tuple = {
    gmcp: []
  };
  let payload;
  let iacIndex = buffer.indexOf(IAC, 0);
  let end;
  let startSB;
  while (iacIndex > -1) {
    //console.log('IAC', iacIndex);
    if (buffer[iacIndex + 1] === WILL) {
      //console.log('IAC WILL', buffer[iacIndex + 2]);
      if (buffer[iacIndex + 2] === GMCP) {
        //console.log('IAC WILL GMCP');
        tuple.gmcp.push({
          start: iacIndex,
          end: iacIndex + 3,
          out: 'IAC WILL GMCP',
          raw: buffer.slice(iacIndex, iacIndex + 3)
        });
      } else if (buffer[iacIndex + 2] === MSSP) {
        //console.log('IAC WILL MSSP');
        tuple.gmcp.push({
          start: iacIndex,
          end: iacIndex + 3,
          out: 'IAC WILL MSSP',
          raw: buffer.slice(iacIndex, iacIndex + 3)
        });
      }
    } else if (buffer[iacIndex + 1] === SB) {
      //sub negotiate
      startSB = iacIndex + 3;
      iacIndex = buffer.indexOf(IAC, iacIndex + 1);
      payload = buffer.slice(startSB, iacIndex);
      //console.log('IAC SB GMCP ' + payload.toString() + ' IAC SE');
      tuple.gmcp.push({
        start: startSB - 3,
        end: iacIndex + 2,
        out: 'IAC SB GMCP ' + payload.toString() + ' IAC SE',
        raw: buffer.slice(startSB - 3, iacIndex + 2)
      });
    } else if (buffer[iacIndex + 1] === DataMark) {
      //console.log('IAC Data Mark');
      tuple.gmcp.push({
        start: iacIndex,
        end: iacIndex + 2,
        out: 'IAC Data Mark',
        raw: buffer.slice(iacIndex, iacIndex + 2)
      });
    }

    iacIndex = buffer.indexOf(IAC, iacIndex + 1);
  }

  if (tuple.gmcp.length === 0) {
    tuple.text = buffer;
  } else {
    tuple.text = buffer.slice(tuple.gmcp[tuple.gmcp.length - 1].end, buffer.length);
  }
  return tuple;
}

function sub(payload, args) {
  args.socket.write(IAC_SB_GMCP);
  args.socket.write(payload);
  args.socket.write(IAC_SE);
  args.log.write('< IAC SB GMCP ' + payload + ' IAC SE \n');
}
module.exports = {
  ping: function (args) {
    sub('Core.Ping', args);
  },
  login: function (args) {
    sub('Core.Login { "name": "lokthar", "password": "Fa2ME,.nE@\n" }', args);
  },
  set: function (args) {
    sub('Core.Supports.Set [ "Comm 1", "Core 1", "Room 1", "Char 1" ]', args);
    sub('Core.Options.Set { "npc_comms" : "off" }', args);
    

  },
  filter: function (args) {
    return through2(function (line, encoding, cb) {
      
      let tuple = extract(line);
      if (tuple.gmcp) {
        _.each(tuple.gmcp, function (entry) {
          if (entry.out === 'IAC WILL GMCP') {
            args.socket.write(IAC_DO_GMCP);
            
            args.log.write('< IAC DO GMCP \n');
          }
          args.log.write('> ' + entry.out + '\n');
        });
      }
      if (tuple.text) {
        this.push(tuple.text);
      }
      cb();
    });
   },
   extract: extract
}