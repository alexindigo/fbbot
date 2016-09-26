var express = require('express')
  , test    = require('tape')
  , common  = require('./common.js')
  , Fbbot   = require('../')
  ;

common.iterateRequests(function(request, handle, callback)
{
  var payloadType = handle.split('-')[0];

  test.test('express with ' + handle, function(t)
  {
    t.plan(request.expected.plan);

    var server
      , app   = express()
      , fbbot = new Fbbot(common.fbbot)
      ;

    // setup tests per instance
    common.setupTests(fbbot, payloadType, request, t, callback);

    // plug-in fbbot
    app.all(common.server.endpoint, fbbot.requestHandler);

    // start the server
    server = app.listen(common.server.port, function()
    {
      common.sendRequest(handle, function(error, response)
      {
        t.error(error, 'POST request should return no error');
        t.equal(response.statusCode, 200, 'POST request should return code 200');

        server.close(function()
        {
          t.ok(true, 'make sure server is closed');
        });
      });
    });

  });
});

test('express - handshake - success', function(t)
{
  t.plan(4);

  var server
    , app   = express()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // plug-in fbbot
  app.all(common.server.endpoint, fbbot.requestHandler);

  // start the server
  server = app.listen(common.server.port, function()
  {
    common.sendHandshake('ok', function(error, response)
    {
      t.error(error, 'GET request should return no error');
      t.equal(response.statusCode, 200, 'GET request should return code 200');
      t.equal(response.body, common.handshakes['ok'].query['hub.challenge'], 'should receive provided challenge back');

      server.close(function()
      {
        t.ok(true, 'make sure server is closed');
      });
    });
  });
});

test('express - handshake - failed', function(t)
{
  t.plan(4);

  var server
    , app   = express()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // plug-in fbbot
  app.all(common.server.endpoint, fbbot.requestHandler);

  // start the server
  server = app.listen(common.server.port, function()
  {
    common.sendHandshake('bad', function(error, response)
    {
      t.error(error, 'GET request should return no error');
      t.equal(response.statusCode, 400, 'GET request should return code 400');
      t.equal(response.body, common.handshakes['bad'].error, 'should received error message');

      server.close(function()
      {
        t.ok(true, 'make sure server is closed');
      });
    });
  });
});
