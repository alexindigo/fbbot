var merge      = require('deeply')
  , hyperquest = require('hyperquest')
  , sendApi    = 'https://graph.facebook.com/v2.6/me/messages?access_token='
  , defaults   = {method: 'POST', headers: {'content-type': 'application/json'}}
  ;

module.exports = request;
module.exports.send = send;

/**
 * Wraps hyperquest to provide extra convenience
 * with handling responses
 *
 * @param   {string} url - url to request
 * @param   {object} [options] - request options
 * @param   {function} callback - invoked on response
 * @returns {stream.Duplex} - request stream
 */
function request(url, options, callback)
{
  if (typeof options == 'function')
  {
    callback = options;
    options  = {};
  }

  return hyperquest(url, options, function(error, response)
  {
    // set body
    response.body = '';

    if (error)
    {
      callback(error, response);
      return;
    }

    // accumulate response body
    response.on('data', function(data)
    {
      response.body += data.toString();
    });

    response.on('end', function()
    {
      callback(null, response);
    });
  });
}

// curl -X POST -H "Content-Type: application/json" -d '{
//   "recipient":{
//   	"id":"USER_ID"
//   },
//   "sender_action":"typing_on"
// }' "https://graph.facebook.com/v2.6/me/messages?access_token=PAGE_ACCESS_TOKEN"

// curl -X POST -H "Content-Type: application/json" -d '{
//   "recipient":{
//     "id":"USER_ID"
//   },
//   "message":{
//     "attachment":{
//       "type":"image",
//       "payload":{
//         "url":"https://petersapparel.com/img/shirt.png"
//       }
//     }
//   }
// }' "https://graph.facebook.com/v2.6/me/messages?access_token=PAGE_ACCESS_TOKEN"

/**
 * Sends provided payload to the FB Graph API
 * and passes parsed result to the provided callback
 *
 * @this  Fbbot#
 * @param {object} payload - payload to send
 * @param {object} [options] - custom transport options
 * @param {function} callback - invoked with the response
 */
function send(payload, options, callback)
{
  var url, body;

  if (typeof options == 'function')
  {
    callback = options;
    options  = {};
  }

  url     = sendApi + this.credentials.token;
  body    = JSON.stringify(payload);
  options = merge(defaults, {headers: {'content-length': body.length}}, options);

  request(url, options, function(error, response)
  {
    if (error)
    {
      this.logger.error({message: 'Unable to send request to FB API', error: error, response: response, url: url.replace(this.credentials.token, '[hidden token]'), body: body, options: options});
      callback(error, response);
      return;
    }

    callback(null, parseJson.call(this, response.body));
  }.bind(this)).write(body);
}

/**
 * Parses provided JSON payload into object
 *
 * @private
 * @this    Fbbot#
 * @param   {string} payload - JSON string to parse
 * @returns {object|undefined} - parsed object or `undefined` if unable to parse
 */
function parseJson(payload)
{
  var data;

  try
  {
    data = JSON.parse(payload);
  }
  catch (e)
  {
    this.logger.error({message: 'Unable to parse provided JSON', error: e, payload: payload});
  }

  return data;
}
