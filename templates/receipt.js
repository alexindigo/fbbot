var merge = require('deeply');

module.exports = renderReceipt;

/**
 * Renders payload from provided data with receipt template
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference/receipt-template
 *
 * @this    Fbbot#
 * @param   {object} receipt - receipt object to render with receipt template
 * @returns {object} - receipt template message payload
 */
function renderReceipt(receipt)
{
  var message, limit = 100;

  if (receipt.elements.length > limit)
  {
    this.logger.warn({message: 'Truncated provided list of elements to first ' + limit + ' elements (maximum for the Receipt Template)', receipt: receipt});
    receipt.elements = receipt.elements.slice(0, limit);
  }

  message = {
    attachment: {
      type   : 'template',
      payload: merge(receipt, {
        template_type: 'receipt'
      })
    }
  };

  this.logger.debug({message: 'Generated message payload with Receipt Template', payload: message});

  return message;
}
