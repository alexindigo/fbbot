module.exports = renderGeneric;

/**
 * Renders payload from provided data with generic template
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference/generic-template
 *
 * @this    Fbbot#
 * @param   {array} elements - list of elements to render with generic template
 * @returns {object} - generic template message payload
 */
function renderGeneric(elements)
{
  var message, limit = 10;

  if (elements.length > limit)
  {
    this.logger.warn({message: 'Truncated provided list of elements to first ' + limit + ' elements (maximum for the Generic Template)', elements: elements});
    elements = elements.slice(0, limit);
  }

  message = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements     : elements
      }
    }
  };

  this.logger.debug({message: 'Generated message payload with Generic Template', payload: message});

  return message;
}
