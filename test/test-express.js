var express    = require('express')
  , bodyParser = require('body-parser')
  , test       = require('tape')
  , common     = require('./common.js')
  , Fbbot      = require('../')
  ;

test('text message with express', function(t)
{
  t.plan(5);

  var server
    , app   = express()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // use middleware
  fbbot.use(function(payload, cb)
  {
    t.deepEquals(payload, common.requests['text'].body, 'global middleware should receive full payload');
    cb(null, payload);
  });

  // message event
  fbbot.on('message', function(message)
  {
    t.deepEquals(message, common.requests['text'].body.entry[0].messaging[0].message, 'message event should receive only message object');
  });

  // fbbot.on('message.text', function(message)
  // {
  //   t.deepEquals(message, common.requests['text'].body.entry[0].messaging[0], 'message event should receive only message object');
  // });

  // plug-in fbbot
  app.use(common.server.endpoint, fbbot.requestHandler);

  // start the server
  server = app.listen(common.server.port, function()
  {
    common.sendRequest('text', function(error, response)
    {
      t.error(error, 'should be no error');
      t.equal(response.statusCode, 200, 'should return code 200');

      server.close(function()
      {
        t.ok(true, 'make sure server is closed');
      });
    });
  });

});

test('attachments-image message with express', function(t)
{
  t.plan(5);

  var server
    , app   = express()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // use middleware
  fbbot.use(function(payload, cb)
  {
    t.deepEquals(payload, common.requests['attachments-image'].body, 'global middleware should receive full payload');
    cb(null, payload);
  });

  // message event
  fbbot.on('message', function(message)
  {
    t.deepEquals(message, common.requests['attachments-image'].body.entry[0].messaging[0].message, 'message event should receive only message object');
  });

  // fbbot.on('message.text', function(message)
  // {
  //   t.deepEquals(message, common.requests['text'].body.entry[0].messaging[0], 'message event should receive only message object');
  // });

  // plug-in fbbot
  app.use(common.server.endpoint, fbbot.requestHandler);

  // start the server
  server = app.listen(common.server.port, function()
  {
    common.sendRequest('attachments-image', function(error, response)
    {
      t.error(error, 'should be no error');
      t.equal(response.statusCode, 200, 'should return code 200');

      server.close(function()
      {
        t.ok(true, 'make sure server is closed');
      });
    });
  });

});
