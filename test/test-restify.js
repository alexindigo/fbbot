var restify = require('restify')
  , tape    = require('tape')
  , common  = require('./common.js')
  , Fbbot   = require('../')
  ;

tape('restify', function(test)
{
  common.iterateRequests(function(request, handle, callback)
  {
    var payloadType = handle.split('-')[0];

    test.test('with ' + handle, function(t)
    {
      t.plan(request.expected.plan);

      var server = restify.createServer()
        , fbbot  = new Fbbot(common.fbbot)
        ;

      // setup tests per instance
      common.setupTests(fbbot, payloadType, request, t, callback);

      // plug-in fbbot
      server.get(common.server.endpoint, fbbot.requestHandler);
      server.post(common.server.endpoint, fbbot.requestHandler);

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

tape('restify - handshake - success', function(t)
{
  t.plan(4);

  var server = restify.createServer()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // plug-in fbbot
  server.get(common.server.endpoint, fbbot.requestHandler);
  server.post(common.server.endpoint, fbbot.requestHandler);

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

tape('restify - handshake - failed', function(t)
{
  t.plan(4);

  var server = restify.createServer()
    , fbbot = new Fbbot(common.fbbot)
    ;

  // plug-in fbbot
  server.get(common.server.endpoint, fbbot.requestHandler);
  server.post(common.server.endpoint, fbbot.requestHandler);

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
