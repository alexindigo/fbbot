var util       = require('util')
  , events     = require('events')
  , bole       = require('bole')
  , merge      = require('deeply')
  , agnostic   = require('agnostic')
  , cache      = require('async-cache')
  , stringify  = require('fast-safe-stringify')
  , handler    = require('./lib/handler.js')
  , middleware  = require('./lib/middleware.js')
  ;

module.exports = Fbbot;
util.inherits(Fbbot, events.EventEmitter);

// defaults
Fbbot.defaults = {
  bodyMaxLength: '1mb',
  bodyEncoding : 'utf8'
};

// expose logger
Fbbot.logger = bole;

// add middleware methods
Fbbot.prototype.use = middleware.use;
// no need to expose middleware handler as public api
Fbbot.prototype.run = middleware.run;
// processing entry point
Fbbot.prototype.handler = handler;



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

  // expose logger
  this.logger = options.logger || bole(options.name || 'fbbot');

  // middleware storage (per event)
  this.stack = {};

  // lock-in public methods
  // wrap `_handler` with agnostic to accommodate different http servers
  this.requestHandler = agnostic(this._handler.bind(this));
}

/**
 * HTTP requests handler, could be used as middleware
 *
 * @private
 * @param {EventEmitter} request - incoming http request object
 * @param {function} respond - http response function
 */
Fbbot.prototype._handler = function(request, respond)
{
  // GET request handling
  if (request.method == 'GET')
  {
    this.log.info();
    this._verifyEndpoint(request, respond);
    return;
  }

  // as per facebook doc – respond as soon as non-humanly possible, always respond with 200 OK
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference#response
  respond(200);

  // let request to finish, then do our thing
  process.nextTick(function()
  {
    // kind of, process no-event middleware
    this.handler(request.body, function(err, payload)
    {
  console.log('\n\n+++ FINISHED PAYLOAD:', err, '<>', JSON.stringify(payload, null, 2), '\n\n');
    });
  }.bind(this));
};

/**
 * Verifies endpoint by replying with the provided challenge
 *
 * @private
 * @param {EventEmitter} request - incoming http request object
 * @param {function} respond - http response function
 */
Fbbot.prototype._verifyEndpoint = function(request, respond)
{
  if (request.query.hub && request.query.hub.verify_token === this.credentials.secret)
  {
    respond(request.query.hub.challenge);
    return;
  }

  respond('Error, wrong validation token');
};
