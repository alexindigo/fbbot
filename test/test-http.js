var http   = require('http')
  , tape   = require('tape')
  , common = require('./common.js')
  , shared = require('./shared-tests.js')
  , Fbbot  = require('../')
  ;

tape('http', function(test)
{
  common.iterateRequests(function(request, handle, callback)
  {
    var payloadType = handle.split('-')[0];

    test.test('with ' + handle, function(t)
    {
      t.plan(request.expected.plan);

      var server
        , fbbot = new Fbbot(common.fbbot)
        ;

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

      // create server plug-in fbbot
      server = http.createServer(fbbot.requestHandler);

      // start the server
      server.listen(common.server.port, function()
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
});

tape('http - handshake - success', function(t)
{
  t.plan(4);

  var server
    , fbbot = new Fbbot(common.fbbot)
    ;

  // create server plug-in fbbot
  server = http.createServer(fbbot.requestHandler);

  // start the server
  server.listen(common.server.port, function()
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

tape('http - handshake - failed', function(t)
{
  t.plan(4);

  var server
    , fbbot = new Fbbot(common.fbbot)
    ;

  // create server plug-in fbbot
  server = http.createServer(fbbot.requestHandler);

  // start the server
  server.listen(common.server.port, function()
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
