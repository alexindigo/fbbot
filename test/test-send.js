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
    // three checks for erroneous requests, and six checks for successful requests
    // with addition or expected extra tests
    t.plan((sending.error ? 3 : 6) + (sending.expectedTests || 0));

    // Id takes over phone_humber
    var expectedPhone = sending.arguments.user['phone_number']
      , expectedId    = sending.arguments.user.id || (expectedPhone ? null : sending.arguments.user)
      ;

    common.startApiServer(function(request, respond)
    {
      t.equal(request.query.access_token, common.fbbot.pageAccessToken, 'should supply proper access token');
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

      // check events
      fbbot.on('send.message', function(data)
      {
        if (expectedId)
        {
          t.equal(data.parent.recipient.id, expectedId, 'should have recipient id available via linked parent object');
        }
        else
        {
          t.equal(data.parent.recipient['phone_number'], expectedPhone, 'should have recipient phone_number available via linked parent object');
        }
      });

      fbbot.send.apply(fbbot, args.concat(function(error, result)
      {
        if (sending.error)
        {
          t.ok(error.message.match(sending.error), 'expect to error with message: ' + sending.error);
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
