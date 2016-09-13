var payloads = {};

module.exports = {
  perRequest : perRequest,
  perMessage : perMessage
};

/**
 * Creates listeners with asserts on per request basis
 *
 * @param {object} fbbot - fbbot instance
 * @param {string} payloadType - payload's type to test
 * @param {object} request - expected request object
 * @param {object} t - test suite instance
 * @param {function} callback - invoked after all tests for this payload type is done
 */
function perRequest(fbbot, payloadType, request, t, callback)
{
  payloads[payloadType] = {};

  // use middleware
  fbbot.use(function(payload, cb)
  {
    t.deepEquals(payload, request.body, 'global middleware should receive full payload, and it should not be modified at this point');
    cb(null, payload);
  });

  // [payloadType] middleware
  fbbot.use(payloadType, function(payload, cb)
  {
    var expected = payloads[payloadType]['middleware'].shift();

    t.deepEquals(payload, expected[payloadType], 'middleware should receive ' + payloadType + ' object, augmented by built-in middleware');
    t.deepEquals(payload.messaging, expected, payloadType + ' object has reference to the parent object, as prototyte');
    t.notOk(payload.hasOwnProperty('messaging'), 'parent property does not pollute ' + payloadType + ' object');
    cb(null, payload);
  });

  // [payloadType] event
  fbbot.on(payloadType, function(payload)
  {
    var expected = payloads[payloadType]['event'].shift();

    t.deepEquals(payload, expected[payloadType], 'event should receive ' + payloadType + ' object');
    t.deepEquals(payload.messaging, expected, payloadType + ' event object has reference to the parent object, as prototyte');
    t.notOk(payload.hasOwnProperty('messaging'), 'parent property does not pollute ' + payloadType + ' event object');
    t.deepEqual(payload, payload.messaging[payloadType], 'keeps reference itself (kind of) through parent object');

    if (payloadType == 'message' && expected[payloadType].type == 'quick_reply')
    {
      t.equal(typeof payload.quick_reply.payload, 'object', 'should parse quick_reply payload into an object');
    }

    if (payloadType == 'postback')
    {
      t.equal(typeof payload.payload, 'object', 'should parse postback payload into an object');
    }
  });

  fbbot.on(payloadType + '.non-existent-type', function()
  {
    t.fail('should not receive anything for non existent type');
  });

  fbbot.on('end', function(error)
  {
    t.error(error, 'should finish without errors');
    callback(null);
  });
}

/**
 * Stores expected object for middleware and event handlers
 *
 * @param {object} fbbot - fbbot instance
 * @param {string} payloadType - payload's type to test
 * @param {object} envelop - expected envelop (message with meta-data) object
 * @param {object} t - test suite instance
 */
function perMessage(fbbot, payloadType, envelop, t)
{
  (payloads[payloadType]['middleware'] = payloads[payloadType]['middleware'] || []).push(envelop);
  (payloads[payloadType]['event']      = payloads[payloadType]['event'] || []).push(envelop);

  // message specific check
  if (envelop.message && envelop.message.type)
  {
    if (!payloads[payloadType][envelop.message.type])
    {
      payloads[payloadType][envelop.message.type] = [];

      fbbot.on('message.' + envelop.message.type, function(message)
      {
        var expected = payloads[payloadType][message.type].shift();

        t.deepEquals(message, expected.message, 'message.' + expected.message.type + ' event should receive message object');
      });
    }

    payloads[payloadType][envelop.message.type].push(envelop);
  }
}
