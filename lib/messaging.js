var messagingTypes = ['delivery', 'postback', 'message'];

module.exports = {
  getType: getType
};

/**
 * Returns preferred messaging type
 *
 * @param   {object} messaging - messaging object
 * @returns {string|undefined} - messaging type name or `undefined` if no match
 */
function getType(messaging)
{
  return messagingTypes.find(function(key){ return (key in messaging); });
}
