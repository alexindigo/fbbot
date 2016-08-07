var Hapi   = require('hapi')
  , tape   = require('tape')
  , common = require('./common.js')
  , Fbbot  = require('../')
  ;

tape.test('hapi minimal setup, no parser', function(t)
{
  t.plan(2);

  var server = new Hapi.Server()
    , fbbot  = new Fbbot(common.fbbot)
    ;

  // setup hapi server
  server.connection({ port: common.server.port });

  // get events
  fbbot.on('message', function(user, message)
  {

  });

  // plug-in fbbot
  server.route({
    method: 'GET',
    path: common.server.endpoint,
    handler: fbbot.requestHandler
  });
  server.route({
    method: 'POST',
    path: common.server.endpoint,
    handler: fbbot.requestHandler
  });

  // start the server
  server.start(function(err)
  {
    t.error(err);

    common.sendRequest('text', function(error, response)
    {
//console.log('\n\n ----- REQUEST', error, 'vs', response.statusCode, '--', response.headers);

      server.stop(function()
      {
        t.ok(true);
      });

    });
  });

});
