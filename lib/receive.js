var find      = require('array-find')
  , clone     = require('deeply')
  , asynckit  = require('asynckit')
  , messaging = require('./messaging.js')
  , normalize = require('./normalize.js')
  , steps     = {
    'payload'   : 'entry',
    'entry'     : 'messaging',
    'messaging' : messaging.getType, // function that returns next step based on payload
    'message'   : ['quick_reply', 'attachments'] // list of possible paths
  }
  ;

module.exports = receive;

/**
 * Iterates asynchronously over payload entries
 *
 * @this  Fbbot#
 * @param {string} [branch] - branch name of the payload, skipped for the top level one
 * @param {object} payload - initial payload object from facebook messenger
 * @param {function} callback - invoked upon error or when all entries were processed
 */
function receive(branch, payload, callback)
{
  var normalized;

  // check for optional argument
  if (typeof branch == 'object')
  {
    callback = payload;
    payload  = branch;
    branch   = 'payload'; // middleware.entryPoint;
  }

  // get proper name
  normalized = normalize(branch);

  this.logger.debug({message: 'TBW something about raw payload'});

  if (typeof payload != 'object')
  {
    this.logger.error({message: 'payload is not an Object', branch: branch, payload: payload});
    callback(new Error('payload <', branch, '> is not an Object'));
    return;
  }

  // run global middleware on initial payload object
  this._run(normalized, payload, function(error, resolvedPayload)
  {
    var nextStep = steps[branch]
      , parent   = {}
      , detachedPayload
      ;

    if (error)
    {
      this.logger.error({message: 'middleware ran into an error', error: error, branch: branch, nextStep: nextStep, originalPayload: payload, resolvedPayload: resolvedPayload});
      callback(error, resolvedPayload);
      return;
    }

    this.logger.info({message: 'TBW - all middleware are ok'});

    if (typeof resolvedPayload != 'object')
    {
      this.logger.error({message: 'payload after middleware is not an Object ', branch: branch, nextStep: nextStep, payload: resolvedPayload});
      callback(new Error('payload after <', branch, '> middleware is not an Object'));
      return;
    }

    // protect payload from accidental changes
    detachedPayload = clone(resolvedPayload);
    detachedPayload.__proto__ = clone(resolvedPayload.__proto__);
    // prepare parent object for next step
    parent[normalized] = resolvedPayload;
    // propagate user data if available
    if (resolvedPayload.user)
    {
      parent['user'] = resolvedPayload.user;
    }

    // notify listeners
    this.emit(normalized, detachedPayload);

    // notify listeners of the specific type
    if (detachedPayload.type)
    {
      this.emit([normalized, detachedPayload.type].join('.'), detachedPayload);
    }

    // pick first matching, out of multi-value
    if (typeof nextStep == 'function')
    {
      nextStep = nextStep(resolvedPayload);
    }

    if (Array.isArray(nextStep))
    {
      nextStep = find(nextStep, function(key){ return (key in resolvedPayload); });
    }

    if (!nextStep || !(nextStep in resolvedPayload))
    {
      this.logger.debug({message: 'no further steps defined, stop right here', branch: branch, nextStep: nextStep, payload: resolvedPayload});
      callback(null, payload);
      return;
    }

    // proceed to the next step
    resolvedPayload = resolvedPayload[nextStep];
    resolvedPayload.__proto__ = parent;

    // iterate over arrays
    if (Array.isArray(resolvedPayload))
    {
      // process all entries in parallel
      // supposedly they are unrelated to each other on this level of details
      asynckit.parallel(resolvedPayload, receive.bind(this, nextStep), callback);
    }
    else
    {
      receive.call(this, nextStep, resolvedPayload, callback);
    }
  }.bind(this));
}
