module.exports = renderButton;

/**
 * Renders payload from provided data with button template
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template
 *
 * @this    Fbbot#
 * @param   {object} data - text + buttons object
 * @returns {object} - button template message payload
 */
function renderButton(data)
{
  var message, limit = 3;

  if (data.buttons.length > limit)
  {
    this.logger.warn({message: 'Truncated provided list of buttons to first ' + limit + ' elements (maximum for the Button Template)', data: data});
    data.buttons = data.buttons.slice(0, limit);
  }

  message = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text         : data.text,
        buttons      : data.buttons
      }
    }
  };

  this.logger.debug({message: 'Generated message payload with Button Template', payload: message});

  return message;
}
