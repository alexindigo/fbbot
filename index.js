var util       = require('util')
  , events     = require('events')
  , bole       = require('bole')
  , merge      = require('deeply')
  , agnostic   = require('agnostic')
  // , cache      = require('async-cache')
  // , stringify  = require('fast-safe-stringify')
  , verify     = require('./lib/verify_endpoint.js')
  , receive    = require('./lib/receive.js')
  , send       = require('./lib/send.js')
  , middleware = require('./lib/middleware.js')
  , incoming   = require('./incoming/index.js')
  , outgoing   = require('./outgoing/index.js')
  , Traverse   = require('./traverse/index.js')
  ;

module.exports = Fbbot;
util.inherits(Fbbot, events.EventEmitter);

// defaults
Fbbot.defaults = {
  bodyMaxLength: '1mb',
  bodyEncoding : 'utf8',
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
// processing entry point
Fbbot.prototype._receive = receive;
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

  this.options = merge(Fbbot.defaults, options || {});

  // creds
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

  // expose logger
  this.logger = options.logger || bole(options.name || 'fbbot');

  // middleware storage (per event)
  this.stack = {};

  // lock-in public methods
  // wrap `_handler` with agnostic to accommodate different http servers
  this.requestHandler = agnostic(this._handler.bind(this));

  // attach lifecycle filters
  incoming(this);
  outgoing(this);

  // receive: create traverse paths
  this.incoming = new Traverse(receive.steps, {
    entry     : middleware.entryPoint,
    middleware: receive.middleware.bind(this),
    emitter   : receive.emitter.bind(this)
  });
  // wrap linkParent method
  this.incoming.linkParent = receive.linkParent.bind(receive, this.incoming.linkParent);

  // // send: create traverse paths
  // this.outgoing = new Traverse(send.steps, {
  //   middleware: send.middleware.bind(this),
  //   emitter   : send.emitter.bind(this)
  // });
  // // wrap linkParent method
  // this.incoming.linkParent = receive.linkParent.bind(receive, this.incoming.linkParent);
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

  this.incoming.traverse(request.body, function(err, payload)
  {
    this.emit('end', err, payload);
  }.bind(this));
};
