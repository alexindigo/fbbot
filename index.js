var util          = require('util')
  , events        = require('events')
  , bole          = require('bole')
  , merge         = require('deeply')
  , agnostic      = require('agnostic')
  // , cache      = require('async-cache')
  // , stringify  = require('fast-safe-stringify')
  , verify        = require('./lib/verify_endpoint.js')
  , send          = require('./lib/send.js')
  , middleware    = require('./lib/middleware.js')
  , inMiddleware  = require('./incoming/index.js')
  , outMiddleware = require('./outgoing/index.js')
  , Traverse      = require('./traverse/index.js')
  , inTraverse    = require('./traverse/incoming.js')
  , outTraverse   = require('./traverse/outgoing.js')
  ;

module.exports = Fbbot;
util.inherits(Fbbot, events.EventEmitter);

// defaults
Fbbot.defaults = {
  bodyMaxLength: '1mb',
  bodyEncoding : 'utf8',
  timeout      : 5000,
  apiUrl       : 'https://graph.facebook.com/v2.6/me/messages?access_token='
};

// expose logger
Fbbot.logger = bole;

// -- public methods

// registers middleware
Fbbot.prototype.use = middleware.use;

// send message to a user
Fbbot.prototype.send = send;
// add message types to the top level
// shouldn't be conflicts since types are all uppercase
util._extend(Fbbot.prototype, send.types);

// -- private methods

// no need to expose middleware handler as public api
Fbbot.prototype._run = middleware.run;
// verifies endpoint to facebook
Fbbot.prototype._verifyEndpoint = verify;

/**
 * Fbbot instance constructor
 *
 * @this Fbbot#
 * @param {object} options - list of customization parameters
 * @constructor
 */
function Fbbot(options)
{
  if (!(this instanceof Fbbot)) return new Fbbot(options);

  /**
   * Custom options per instance
   * @type {object}
   */
  this.options = merge(Fbbot.defaults, options || {});

  /**
   * Store credentials
   * @type {object}
   */
  this.credentials =
  {
    // keep simple naming for internal reference
    token : this.options.pageAccessToken || this.options.token,
    secret: this.options.verifyToken || this.options.secret
  };

  if (!this.credentials.token || !this.credentials.secret)
  {
    throw new Error('Both `token` (pageAccessToken) and `secret` (verifyToken) are required');
  }

  // compose apiUrl
  this.options.apiUrl += this.credentials.token;

  /**
   * expose logger
   * @type {object}
   */
  this.logger = options.logger || bole(options.name || 'fbbot');

  /**
   * middleware storage (per event)
   * @type {object}
   * @private
   */
  this._stack = {};

  /**
   * lock-in public methods
   * wrap `_handler` with agnostic to accommodate different http servers
   * @type {function}
   */
  this.requestHandler = agnostic(this._handler.bind(this));

  // attach lifecycle filters
  inMiddleware(this);
  outMiddleware(this);

  /**
   * create incoming traverse paths
   * @type {Traverse}
   * @private
   */
  this._incoming = new Traverse(inTraverse.steps, {
    entry     : middleware.entryPoint,
    middleware: inTraverse.middleware.bind(this),
    emitter   : inTraverse.emitter.bind(this),
    prefix    : inTraverse.prefix
  });
  // wrap linkParent method
  this._incoming.linkParent = inTraverse.linkParent.bind(null, this._incoming.linkParent);

  /**
   * create outgoing traverse paths
   * @type {Traverse}
   * @private
   */
  this._outgoing = new Traverse(outTraverse.steps, {
    middleware: outTraverse.middleware.bind(this),
    emitter   : outTraverse.emitter.bind(this),
    prefix    : outTraverse.prefix
  });
  // wrap linkParent method
  this._outgoing.linkParent = outTraverse.linkParent.bind(null, this._outgoing.linkParent);
}

/**
 * HTTP requests handler, could be used as middleware
 *
 * @private
 * @this Fbbot#
 * @param {EventEmitter} request - incoming http request object
 * @param {function} respond - http response function
 */
Fbbot.prototype._handler = function(request, respond)
{
  this.logger.info(request);

  // GET request handling
  if (request.method == 'GET')
  {
    this._verifyEndpoint(request, respond);
    return;
  }

  // as per facebook doc – respond as soon as non-humanly possible, always respond with 200 OK
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference#response
  respond(200);

  this._incoming.traverse(request.body, function(err, payload)
  {
    this.emit('end', err, payload);
  }.bind(this));
};
