var http   = require('http')
  , tape   = require('tape')
  , common = require('./common.js')
  , Fbbot  = require('../')
  ;

tape.test('http.createServer minimal setup', function(t)
{
  t.plan(2);

  var server, fbbot  = new Fbbot(common.fbbot);

  // get events
  fbbot.on('message', function(user, message)
  {

  });

  // plug-in fbbot
  server = http.createServer(fbbot.requestHandler);

  // start the server
  server.listen(common.server.port, function(err)
  {
    t.error(err);

    common.sendRequest('text', function(error, response)
    {
// console.log('\n\n ----- REQUEST', error);
// console.log('\n\n ----- REQUEST', 'vs', response.statusCode, '--', response.headers);

      server.close(function()
      {
        t.ok(true);
      });

    });
  });

});

tape.only('handshake', function(t)
{
      var fbbot = new Fbbot(common.fbbot)
        , server
        ;

      // plug-in fbbot
      server = http.createServer(fbbot.requestHandler);

      // start the server
      server.listen(common.server.port, function(err)
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
