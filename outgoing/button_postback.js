module.exports = buttonPostback;

/**
 * Stringifies provided button.postback payload
 *
 * @this  Fbbot#
 * @param {object} payload - button.postback object
 * @param {function} callback - invoked after stringification is done
 */
function buttonPostback(payload, callback)
{
  if (typeof payload.payload != 'string')
  {
    payload.payload = JSON.stringify(payload.payload);
  }

  callback(null, payload);
}
