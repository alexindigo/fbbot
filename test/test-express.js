var express    = require('express')
  , bodyParser = require('body-parser')
  , tape       = require('tape')
  , common     = require('./common.js')
  , Fbbot      = require('../')
  ;

tape.test('express minimal setup, no parser', function(t)
{
  t.plan(1);

  var server
    , app   = express()
    , fbbot = new Fbbot(common.fbbot)
    ;

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


tape.test('express minimal setup, with bodyParser middleware', function(t)
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
