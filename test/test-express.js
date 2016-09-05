var express    = require('express')
  , bodyParser = require('body-parser')
  , test       = require('tape')
  , common     = require('./common.js')
  , Fbbot      = require('../')
  ;

test.only('express minimal setup, no parser', function(t)
{
  t.plan(1);

  var server
    , app   = express()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // get events
  fbbot.on('message', function(message)
  {
//console.log('\n\n GOT MESSAGE', message, '<<\n\n');
  });

  fbbot.use(function(payload, cb)
  {
//console.log('\n\n\n MIDDLEWARE:', payload, '\n\n\n\n');
    cb(null, payload);
  });

  // plug-in fbbot
  app.use(common.server.endpoint, fbbot.requestHandler);

  // start the server
  server = app.listen(common.server.port, function()
  {
    common.sendRequest('attachments-image', function(error, response)
    {
//console.log('\n\n ----- REQUEST', error, 'vs', response.statusCode, '--', response.headers);

      server.close(function()
      {
        t.ok(true);
      });
    });
  });

});


test('express minimal setup, with bodyParser middleware', function(t)
{
  t.plan(1);

  var server
    , app   = express()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // preparations
  app.use(bodyParser.json({ limit: 1024 * 1000 }));

  // get events
  fbbot.on('message', function(user, message)
  {

  });

  // plug-in fbbot
  app.use(common.server.endpoint, fbbot.middleware);
  // start the server
  server = app.listen(common.server.port, function()
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
