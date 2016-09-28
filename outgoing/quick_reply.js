module.exports = quickReply;

/**
 * Stringifies provided quick reply payload
 *
 * @this  Fbbot#
 * @param {object} payload - quick_reply object
 * @param {function} callback - invoked after stringification is done
 */
function quickReply(payload, callback)
{
  if (typeof payload.payload != 'string')
  {
    payload.payload = JSON.stringify(payload.payload);
  }

  callback(null, payload);
}
