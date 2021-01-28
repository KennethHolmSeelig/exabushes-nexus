'use strict'

const Telnet = require('telnet-client')

async function run() {
  let connection = new Telnet()

  // these parameters are just examples and most probably won't work for your use-case.
  let params = {
    host: '127.0.0.1',
    port: 8080,
    debug: true,
    negotiationMandatory: false,
    timeout: 1500
  }

  try {
    await connection.connect(params)
  } catch(error) {
    // handle the throw (timeout)
  }

  let res = await connection.exec('uptime')
  console.log('async result:', res)
}

run()