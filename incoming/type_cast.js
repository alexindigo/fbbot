var find      = require('array-find')
  , normalize = require('../lib/normalize.js')
  ;

module.exports = typeCast;

// order here is important, not just alphabetical, although I did try to keep it nice
// some messages contain `text` and other fields, and shouldn't be treated as separate type
// examples: attachments#fallback (with url), quick_reply (with payload), sticker_id+attachments#image (sticker)
var types = [
  // meta
  'delivery',
  'echo',
  'read',

  // data
  'sticker_id',
  'attachments',
  'postback',
  'quick_reply',
  'text'
];

/**
 * Casts message type based on the present fields from the list
 *
 * @param {object} payload - message object
 * @param {function} callback - invoked after type casting is done
 */
function typeCast(payload, callback)
{
  var type = find(types, function(t){ return (t in payload); });

  if (type)
  {
    payload.type = normalize(type);
  }

  callback(null, payload);
}
