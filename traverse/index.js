var util     = require('util')
  , events   = require('events')
  , typeOf   = require('precise-typeof')
  , find     = require('array-find')
  , asynckit = require('asynckit')
  , logger   = require('bole')('traverse')
  ;

module.exports = Traverse;
util.inherits(Traverse, events.EventEmitter);

/**
 * Traverse constructor
 *
 * @constructor
 * @param {object} steps - list of steps to follow
 * @param {object} [options] - custom options
 */
function Traverse(steps, options)
{
  // always create new instance
  if (!(this instanceof Traverse)) return new Traverse(steps, options);

  // make options optional :)
  options = options || {};

  // store the main thing
  this.steps = steps;

  // custom logger instance
  // expected bunyan-compatiable API
  this.logger = options.logger || logger;

  // custom entry point, otherwise empty string will be used
  this.entry = options.entry || '';
  // allow prefixed handles
  this.prefix = options.prefix || null;

  // if no middleware controller provided, just make it pass though untouched
  this.middleware = options.middleware || this.middlewarePassthru;

  // use custom emitter or built-in
  this.emitter = options.emitter || this.emit;
}

/**
 * default passthru middleware
 *
 * @param {string} branch - handle of the current branch
 * @param {object} payload - branch's data object
 * @param {function} callback - invoked after middleware is done
 */
Traverse.prototype.middlewarePassthru = function(branch, payload, callback)
{
  callback(null, payload);
};

/**
 * Traverses asynchronously over provided structure
 *
 * @param {string} [branch] - branch name of the payload, skipped for the top level one
 * @param {object|array} payload - initial payload object
 * @param {function} callback - invoked upon error or when all entries were processed
 */
Traverse.prototype.traverse = function(branch, payload, callback)
{
  // check for optional argument
  if (typeOf(branch) == 'object')
  {
    callback = payload;
    payload  = branch;
    branch   = this.entry;
  }

  // allow it to handle arrays as entry payload
  if (typeOf(payload) == 'array')
  {
    // process all entries in parallel
    // supposedly they are unrelated to each other on this level of details
    asynckit.parallel(payload, this.traverse.bind(this, branch), callback);
    return;
  }

  this.logger.debug({message: 'TBW something about raw payload'});

  if (typeOf(payload) != 'object')
  {
    this.logger.error({message: 'payload is not an Object', branch: branch, payload: payload});
    callback(new Error('payload <' + branch + '> is not an Object'));
    return;
  }

  // invoke middleware controller with custom context
  this.middleware(this.prefixedBranch(branch), payload, function(error, resolvedPayload)
  {
    var nextStep = this.steps[branch]
      , nextStepPayload
      ;

    if (error)
    {
      this.logger.error({message: 'middleware ran into an error', error: error, branch: branch, prefixed: this.prefixedBranch(branch), nextStep: nextStep, originalPayload: payload, resolvedPayload: resolvedPayload});
      callback(error, resolvedPayload);
      return;
    }

    if (typeOf(resolvedPayload) != 'object' && typeOf(resolvedPayload) != 'array')
    {
      this.logger.error({message: 'payload after middleware is not an Object or an Array', branch: branch, prefixed: this.prefixedBranch(branch), nextStep: nextStep, payload: resolvedPayload});
      callback(new Error('payload after <' + branch + '> middleware is not an Object or an Array'));
      return;
    }

    this.logger.info({message: 'TBW - all middleware are ok'});

    // done with all the error checks
    // notify listeners
    this.emitter(this.prefixedBranch(branch), resolvedPayload);

    // conditional next step
    // this order allows for custom function to return array of possible next steps
    if (typeOf(nextStep) == 'function')
    {
      nextStep = nextStep(resolvedPayload);
    }

    // pick first matching, out of multi-value
    if (typeOf(nextStep) == 'array')
    {
      nextStep = find(nextStep, function(key){ return (key in resolvedPayload); });
    }

    if (!nextStep || !(nextStep in resolvedPayload))
    {
      this.logger.debug({message: 'no further steps possible, stop right here', branch: branch, prefixed: this.prefixedBranch(branch), nextStep: nextStep, payload: resolvedPayload});
      callback(null, resolvedPayload);
      return;
    }

    // proceed to the next step
    nextStepPayload = this.linkParent(branch, resolvedPayload, resolvedPayload[nextStep]);

    // do another round
    this.traverse.call(this, nextStep, nextStepPayload, function(err, nextStepResolvedPayload)
    {
      if (err)
      {
        callback(err, nextStepResolvedPayload);
        return;
      }

      // re-construct original structure with updated data
      resolvedPayload[nextStep] = nextStepResolvedPayload;
      callback(null, resolvedPayload);
    });
  }.bind(this));
};

/**
 * Links parent object to the next-step object
 *
 * @param   {string} branch - current branch of the payload
 * @param   {object} parentPayload - parent payload object
 * @param   {mixed} nextPayload - next step payload object
 * @returns {mixed} - augmented next step payload object
 */
Traverse.prototype.linkParent = function(branch, parentPayload, nextPayload)
{
  var parent = {parent: parentPayload};

  // keep "friendly" reference to the parent object
  parent[branch] = parentPayload;

  // inject `parent` object into the prototype chain
  parent.__proto__  = nextPayload.__proto__;
  nextPayload.__proto__ = parent;

  return nextPayload;
};

/**
 * Resolves branch name with instance prefix
 *
 * @param   {string} branch - handle of the branch
 * @returns {string} - reslved branch name
 */
Traverse.prototype.prefixedBranch = function(branch)
{
  return [this.prefix, branch].join('.').replace(/^\.+|\.+$/g, '');
};
