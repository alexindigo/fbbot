var clone     = require('deeply')
  , messaging = require('../lib/messaging.js')
  ;

module.exports = userInit;

/**
 * Creates `user` object within `message`,
 * based on `sender` property.
 *
 * @param {object} payload - messaging envelop object
 * @param {function} callback - invoked after type casting is done
 */
function userInit(payload, callback)
{
  var type = messaging.getType(payload);

  if (payload.sender && payload[type])
  {
    // detach new object from the source
    payload[type].user = clone(payload.sender);
  }

  callback(null, payload);
}
