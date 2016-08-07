var restify = require('restify')
  , tape    = require('tape')
  , common  = require('./common.js')
  , Fbbot   = require('../')
  ;

tape.test('restify minimal setup, no parser', function(t)
{
  t.plan(1);

  var server = restify.createServer()
    , fbbot = new Fbbot(common.fbbot)
    ;

// server.use(restify.bodyParser({ maxBodySize: 1024 * 1000 }));

  // get events
  fbbot.on('message', function(user, message)
  {

  });

  // plug-in fbbot
  server.get(common.server.endpoint, fbbot.requestHandler);
  server.post(common.server.endpoint, fbbot.requestHandler);

  // start the server
  server.listen(common.server.port, function()
  {

    common.sendRequest('text', function(error, response)
    {
//console.log('\n\n ----- REQUEST', error, 'vs', response.statusCode, '--', response.headers);

      server.close(function()
      {
        t.ok(true);
      });
    });
  });

});

tape.test('restify minimal setup, with bodyParser middleware', function(t)
{
  t.plan(1);

  var server = restify.createServer()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // get events
  fbbot.on('message', function(user, message)
  {

  });

  // attach bodyParser
  server.use(restify.bodyParser({ maxBodySize: 1024 * 1000 }));

  // plug-in fbbot
  server.get(common.server.endpoint, fbbot.requestHandler);
  server.post(common.server.endpoint, fbbot.requestHandler);

  // start the server
  server.listen(common.server.port, function()
  {
    common.sendRequest('text', function(error, response)
    {
//console.log('\n\n ----- REQUEST', error, 'vs', response.statusCode, '--', response.headers);

      server.close(function()
      {
        t.ok(true);
      });
    });
  });

});
