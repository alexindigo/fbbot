var clone     = require('deeply')
  , send      = require('../lib/send.js')
  , messaging = require('../lib/messaging.js')
  ;

module.exports = userInit;

/**
 * Creates `user` object within `message`,
 * based on `sender` property.
 *
 * @this  Fbbot#
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

    // add user tailored send functions
    // but keep it outside of own properties
    payload[type].user.__proto__ = {send: send.factory(this, payload[type].user)};
  }

  callback(null, payload);
}
