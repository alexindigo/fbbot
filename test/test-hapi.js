var Hapi   = require('hapi')
  , tape   = require('tape')
  , common = require('./common.js')
  , shared = require('./shared-tests.js')
  , Fbbot  = require('../')
  ;

tape('hapi', function(test)
{
  common.iterateRequests(function(request, handle, callback)
  {
    var payloadType = handle.split('-')[0];

    test.test('with ' + handle, function(t)
    {
      t.plan(request.expected.plan);

      var server = new Hapi.Server()
        , fbbot  = new Fbbot(common.fbbot)
        ;

      // setup hapi server
      server.connection({ port: common.server.port });

      // run request wide tests
      shared.perRequest(fbbot, payloadType, request, t, callback);

      // iterate over entries-messages
      request.expected.entry.forEach(function(entry)
      {
        entry.messaging.forEach(function(message)
        {
          shared.perMessage(fbbot, payloadType, message, t);
        });
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
      server.start(function()
      {
        common.sendRequest(handle, function(error, response)
        {
          t.error(error, 'should be no error');
          t.equal(response.statusCode, 200, 'should return code 200');

          server.stop(function()
          {
            t.ok(true, 'make sure server is closed');
          });
        });
      });

    });
  });

});

tape('hapi - handshake - success', function(t)
{
  t.plan(4);

  var server = new Hapi.Server()
    , fbbot  = new Fbbot(common.fbbot)
    ;

  // setup hapi server
  server.connection({ port: common.server.port });

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
  server.start(function()
  {
    common.sendHandshake('ok', function(error, response)
    {
      t.error(error, 'GET request should return no error');
      t.equal(response.statusCode, 200, 'GET request should return code 200');
      t.equal(response.body, common.handshakes['ok'].query['hub.challenge'], 'should receive provided challenge back');

      server.stop(function()
      {
        t.ok(true, 'make sure server is closed');
      });
    });
  });
});

tape('hapi - handshake - failed', function(t)
{
  t.plan(4);

  var server = new Hapi.Server()
    , fbbot  = new Fbbot(common.fbbot)
    ;

  // setup hapi server
  server.connection({ port: common.server.port });

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
  server.start(function()
  {
    common.sendHandshake('bad', function(error, response)
    {
      t.error(error, 'GET request should return no error');
      t.equal(response.statusCode, 400, 'GET request should return code 400');
      t.equal(response.body, common.handshakes['bad'].error, 'should received error message');

      server.stop(function()
      {
        t.ok(true, 'make sure server is closed');
      });
    });
  });
});
