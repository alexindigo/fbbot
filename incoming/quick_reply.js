module.exports = quickReply;

/**
 * Parse quick reply payload
 *
 * @param {object} payload - messaging envelop object
 * @param {function} callback - invoked after type casting is done
 */
function quickReply(payload, callback)
{
  if (payload.quick_reply && typeof payload.quick_reply.payload == 'string')
  {
    // TODO: Make better parse and as a library
    payload.quick_reply.payload = JSON.parse(payload.quick_reply.payload);
  }

  callback(null, payload);
}
