var toCamelCase = require('to-camel-case')
  , request     = require('./request.js')
  , templates   =
  {
    generic: require('../templates/generic.js'),
    button: require('../templates/button.js'),
    receipt: require('../templates/receipt.js')
  }
  ;

// API
module.exports = send;
module.exports.factory = factory;

// predefined message types
var types = module.exports.types =
{
  // default type, doesn't define any specific message type
  // requires all the fields in the payload
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference
  MESSAGE: 'message',

  // sender actions types
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/sender-actions
  MARK_SEEN: 'mark_seen',
  TYPING_ON: 'typing_on',
  TYPING_OFF: 'typing_off',

  // regular text message
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/text-message
  TEXT: 'text',

  // single image attachment
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/image-attachment
  IMAGE: 'image',

  // audio file attachment
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/audio-attachment
  AUDIO: 'audio',

  // video file attachment
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/video-attachment
  VIDEO: 'video',

  // generic file attachment
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/file-attachment
  FILE: 'file',

  // generic template
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/generic-template
  GENERIC: 'generic',

  // button template
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template
  BUTTON: 'button',

  // receipt template
  // https://developers.facebook.com/docs/messenger-platform/send-api-reference/receipt-template
  RECEIPT: 'receipt'
};

/**
 * Sends provided messages to the user, specified by user object or id
 * Note: `type` or `data` must be provided
 *
 * TODO: Add notification types
 * TODO: Send multiple messages of different types
 * TODO: Support local files upload
 * TODO: Add airline templates
 *
 * @this  Fbbot#
 * @param {object|string} user - either user object `{id: '...'}` or user id as string
 * @param {string} [type] - type/template of the message to send data as
 * @param {object|array|string} [data] - data object to send
 * @param {function} [callback] - invoked on response from facebook server
 */
function send(user, type, data, callback)
{
  var payload;

  // handle optional `data`
  if (typeof data == 'function')
  {
    callback = data;
    data     = {};
  }

  // handle optional `type`
  if (typeof type == 'object')
  {
    data = type;
    type = types.MESSAGE;
  }

  // handle optional callback
  if (!callback)
  {
    callback = function(){};
  }

  // if string was provided, assume it's user id
  if (typeof user == 'string')
  {
    user = {id: user};
  }

  // TODO: Add outgoing middleware support per type
  // TODO: Augment with user object
  // // run global middleware on initial payload object
  // this._run('send.' + type, data, function(error, resolvedPayload)


  // Get only `id` or `phone_number` for the object,
  // since it might have other things like `first_name`, `last_name`, etc
  payload = {recipient: user.id ? {id: user.id} : {phone_number: user.phone_number}};

  // everything is a message, except sender_actions
  if ([types.MARK_SEEN, types.TYPING_ON, types.TYPING_OFF].indexOf(type) != -1)
  {
    payload['sender_action'] = type;
  }
  else
  {
    payload['message'] = generateMessage.call(this, type, data);
  }

  // TODO: Add outgoing middleware support
  // this._run('send', payload, function(error, resolvedPayload)

  // send it
  request.send.call(this, payload, function(error, result)
  {
    if (error)
    {
      this.logger.error({message: 'Unable to send message to user', error: error, user: user, type: type, data: data, payload: payload});
      callback(error, result);
      return;
    }

    this.logger.info({message: 'Sent message to user', result: result, user: user, type: type});
    this.logger.debug({message: 'Sent message to user', result: result, user: user, type: type, data: data, payload: payload});

    callback(null, result);
  }.bind(this));
}

/**
 * Generates message from the provided data object
 * with respect for the message type
 *
 * @private
 * @this    Fbbot#
 * @param   {string} type - message type
 * @param   {object} data - message data object
 * @returns {object} - generated message object
 */
function generateMessage(type, data)
{
  var message;

  switch (type)
  {
    // default message type, no need to perform special actions, will be sent as is
    case types.MESSAGE:
      message = data;
      break;

    case types.TEXT:
      message = {text: data};
      break;

    case types.IMAGE:
    case types.AUDIO:
    case types.VIDEO:
    case types.FILE:
      message = {attachment: {type: type, payload: {url: data}}};
      break;

    case types.GENERIC:
      message = templates.generic.call(this, data);
      break;

    case types.BUTTON:
      message = templates.button.call(this, data);
      break;

    case types.RECEIPT:
      message = templates.receipt.call(this, data);
      break;

    default:
      this.logger.error({message: 'Unrecognized message type', type: type, payload: data});
  }

  return message;
}

/**
 * Creates user tailored (per message type) set of send methods
 *
 * @param   {object} context - context to bind to
 * @param   {object|string} user - user account to tailor to
 * @returns {function} - user tailored function
 */
function factory(context, user)
{
  var tailored = send.bind(context, user);

  // add custom per type send method
  Object.keys(types).forEach(function(type)
  {
    tailored[toCamelCase(type)] = send.bind(context, user, types[type]);
  });

  return tailored;
}
