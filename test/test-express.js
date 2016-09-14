var express = require('express')
  , tape    = require('tape')
  , common  = require('./common.js')
  , shared  = require('./shared-tests.js')
  , Fbbot   = require('../')
  ;

tape('express', function(test)
{
  common.iterateRequests(function(request, handle, callback)
  {
    var payloadType = handle.split('-')[0];

    test.test('with ' + handle, function(t)
    {
      t.plan(request.expected.plan);

      var server
        , app   = express()
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

      // plug-in fbbot
      app.all(common.server.endpoint, fbbot.requestHandler);

      // start the server
      server = app.listen(common.server.port, function()
      {
        common.sendRequest(handle, function(error, response)
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
  });

});

tape.only('handshake', function(t)
{
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
          t.error(error, 'should be no error');
          t.equal(response.statusCode, 200, 'should return code 200');

          server.close(function()
          {
            t.ok(true, 'make sure server is closed');
          });
        });
      });

});
