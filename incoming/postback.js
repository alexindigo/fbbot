module.exports = postback;

/**
 * Parses provided payload
 * Note: always expects postback payload to be JSON
 *
 * @this  Fbbot#
 * @param {object} payload - messaging envelop object
 * @param {function} callback - invoked after type casting is done
 */
function postback(payload, callback)
{
  if (typeof payload.payload == 'string')
  {
    payload.payload = JSON.parse(payload.payload);
  }

  callback(null, payload);
}
