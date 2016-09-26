var canonical = {
  // incoming:
  'sticker_id' : 'sticker',
  'attachments': 'attachment'
  // outgoing:
  // nothing to normalize yet
};

module.exports = normalize;

/**
 * Normalizes name to use within public interfaces
 *
 * @param   {string} type - internal protocol naming
 * @returns {string} - normalized "public" naming
 */
function normalize(type)
{
  return canonical[type] || type;
}
