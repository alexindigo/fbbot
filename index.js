var util    = require('util')
  , events  = require('events')
  
  , merge   = require('deeply')
  , rawBody = require('raw-body')

  , adapter = require('./adapters/index.js')
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
  var aa = adapter(request, response, next);

//console.log('\n\n\n RESPONSE TYPE:', util.inspect(response, true, 0, true), '<< \n\n\n');
//console.log('\n CLIENT:', request.client, '\nTYPE:', typeof request.client, '\n INSIDE:', util.inspect(request.client, true, 0, true), '!!!\n\n\n');

  this._parseBody(request, function(err)
  {
    var responseCode = 202;
//console.log('Got here, body!!!!:\n\n', request.body, '\n\n====\n\n', request.headers, '\n\n');

    if (typeof response == 'function')
    {
      response('').code(responseCode);
    }
    else
    {
      response.statusCode = responseCode;
      response.send ? response.send('') : response.end('');
    }

  });

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

  if (typeof request.body == 'object' || typeof request.payload == 'object')
  {
    request.body = request.body || request.payload;
    callback(null, request.body);
    return;
  }

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
