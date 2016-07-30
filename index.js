var util    = require('util')
  , merge   = require('deeply')
  , rawBody = require('raw-body')
  , events  = require('events')
  ;

module.exports = Fbbot;

// defaults
Fbbot.defaults = {
  bodyMaxLength: '1mb',
  bodyEncoding : 'utf8'
};

util.inherits(Fbbot, events.EventEmitter);

/**
 * Fbbot instance constructor
 *
 * @param {object} options - list of customization parameters
 * @constructor
 */
function Fbbot(options)
{
  if (!(this instanceof Fbbot)) return new Fbbot(options);

  this.options = merge(Fbbot.defaults, options || {});

  // lock-in public methods
  // request handler is the same middleware
  // just more semantic name for some use cases
  this.requestHandler = this.middleware = this.middleware.bind(this);
}

/**
 * HTTP requests handler, could be used as middleware
 *
 * @param {http.IncomingMessage} request - incoming http request object
 * @param {http.ServerResponse} response - outgoing http response object
 * @param {function} next - outgoing http response object
 */
Fbbot.prototype.middleware = function(request, response, next)
{
  console.log('Got here, body:', request.body);
  response.send('Hello Express!');

};

/**
 * Parses body of the request into an object
 *
 * @private
 * @param {http.IncomingMessage} request - request object
 * @param {function} callback - invoked after body parsing is done (either successfully or not)
 */
Fbbot.prototype._parseBody = function(request, callback)
{
  var options = {
    length  : request.headers['content-length'],
    limit   : this.options.bodyMaxLength,
    encoding: this.options.bodyEncoding
  };

  rawBody(request, options, function(error, body)
  {
    if (error) return callback(error);

    try
    {
      request.body = JSON.parse(body);
    }
    catch (e)
    {
      // behave like express/body-parser
      request.body = {};
      return callback(e, body);
    }

    callback(null, request.body);
  });
};
