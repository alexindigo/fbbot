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

var canonical = {
  'sticker_id' : 'sticker',
  'attachments': 'attachment'
};

function typeCast(payload, callback)
{
  var type = types.find(function(t){ return (t in payload); });

  if (type)
  {
    // make it as non-enumerable and frozen
    Object.defineProperty(payload, 'type', {
      value: normalize(type)
    });
  }

console.log('\n\n\n --- type cast --- \n>>', type, '<< + ', payload, '\n++++++\n\n\n');

  callback(null, payload);
}

/**
 * normalizes name to use within public interfaces
 *
 * @param   {string} type - internal protocol naming
 * @returns {string} - normalized "public" naming
 */
function normalize(type)
{
  return canonical[type] || type;
}
