var canonical = {
  'sticker_id' : 'sticker',
  'attachments': 'attachment'
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
