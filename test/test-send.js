var test   = require('tape')
  , common = require('./common.js')
  , Fbbot  = require('../')
  ;

// reusable attachment
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
// {
//   "recipient_id": "USER_ID",
//   "message_id": "mid.1473372944816:94f72b88c597657974",
//   "attachment_id": "1745504518999123"
// }

// regular response
// {
//   "recipient_id": "1008372609250235",
//   "message_id": "mid.1456970487936:c34767dfe57ee6e339"
// }


common.iterateSendings(function(sending, handle, callback)
{
  var type = handle.split('-')[0];

  test.test('send ' + handle + ' with ' + Object.keys(sending.arguments).join(', ') + ' arguments', function(t)
  {
    t.plan(4);

    common.startApiServer(function(request, respond)
    {
      t.deepEqual(request.body, sending.expected, 'expects to have proper payload for message type: ' + type);
      respond(sending.response);
    },
    function(fbbotOptions, done)
    {
      var args  = []
        , fbbot
        ;

      // custom per test endpoint
      if (sending.endpoint)
      {
        fbbotOptions.apiUrl = sending.endpoint;
      }

      fbbot = new Fbbot(fbbotOptions);

      t.equal(fbbot.options.apiUrl, fbbotOptions.apiUrl + fbbotOptions.pageAccessToken, 'respect custom apiUrl and augment it with correct token');

      if (sending.arguments.user)
      {
        args.push(sending.arguments.user);
      }

      if (sending.arguments.type)
      {
        args.push(fbbot[sending.arguments.type] || sending.arguments.type); // e.g. fbbot['MARK_SEEN'] or 'custom_thing'
      }

      if (sending.arguments.data)
      {
        args.push(sending.arguments.data);
      }

      fbbot.send.apply(fbbot, args.concat(function(error, result)
      {
        if (sending.error)
        {
          t.ok(error.message.match(sending.error), 'expect to error with message: ' + sending.error);
          t.equal(error.name, 'Error', 'expect regular error object');
        }
        else
        {
          t.error(error, 'should result in no error');
        }

        t.deepEqual(result, sending.response, 'expect to pass response all the way through');

        done(callback);
      }));
    });
  });
});
