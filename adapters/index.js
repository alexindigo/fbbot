var IncomingMessage = require('http').IncomingMessage
  , EventEmitter    = require('events').EventEmitter
    // adapters
  , express = require('./express.js')
  , hapi    = require('./hapi.js')
  , http    = require('./http.js')
  , restify = require('./restify.js')
  ;

module.exports = adapter;

function adapter(request, response, next)
{
  // address the elephant in the room
  // be normal
  if (request instanceof IncomingMessage)
  {
    // `restify` being a good citizen, identifies itself
    if (request.serverName == 'restify')
    {
      console.log('\n\n !!! Restify !!!\n\n');
      return;
    }
    // express, or something pretending to be,
    // it'd better be :)
    else if (typeof request.next == 'function')
    {
      console.log('\n\n !!! Express !!!\n\n');
      return;
    }
    // assume everything else either native http.
    // or something pretending to be it very hard
    else
    {
      console.log('\n\n !!! http !!!\n\n');
      return;
    }
  }
  // or be black sheep
  else if (request instanceof EventEmitter)
  {
    // hapijs
    if (typeof request.server == 'object' && typeof request.server.info == 'object')
    {
      console.log('\n\n !!! HAPIJS !!!\n\n');
      return;
    }
  }

  // nothing found, booo
  throw new TypeError('Unsupported http server type. Please provide server specific adapter.');
}
