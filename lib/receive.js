var messaging = require('./messaging.js')
  , normalize = require('./normalize.js')
  ;

module.exports = {

  // list of receive steps
  steps: {
    'payload'   : 'entry',
    'entry'     : 'messaging',
    'messaging' : messaging.getType, // function that returns next step based on payload
    'message'   : ['quick_reply', 'attachments'] // list of possible paths
  },

  linkParent: linkParent,
  middleware: middleware,
  emitter   : emitter
};

/**
 * Wraps original linkParent method
 * and adds normalized handle reference to the parent object
 *
 * @param   {function} original - original linkParent method
 * @param   {string} branch - current branch of the payload
 * @param   {object} parentPayload - parent payload object
 * @param   {mixed} nextPayload - next step payload object
 * @returns {mixed} - augmented next step payload object
 */
function linkParent(original, branch, parentPayload, nextPayload)
{
  // get proper name
  var normalized = normalize(branch);

  var result = original(branch, parentPayload, nextPayload);

  // add normalized handle reference
  result.__proto__[normalized] = parentPayload;

  // add user object reference
  if (parentPayload.user)
  {
    result.__proto__['user'] = parentPayload.user;
  }

  return result;
}

/**
 * Traverse middleware for receiving flow
 *
 * @this  Fbbot#
 * @param {string} branch - branch name of the payload
 * @param {object} payload - initial payload object from facebook messenger
 * @param {function} callback - invoked upon error or when all entries were processed
 */
function middleware(branch, payload, callback)
{
  // get proper name
  var normalized = normalize(branch);

  this.logger.debug({message: 'TBW something about raw payload', branch: branch, normalized: normalized, payload: payload});

  // add branch reference to the parent object

  // run through all registered middleware
  this._run(normalized, payload, function(error, resolvedPayload)
  {
    var normalizeType;

    if (payload.type)
    {
      normalizeType = normalize(payload.type);
      this._run([normalized, normalizeType].join('.'), resolvedPayload, callback);
    }
    // be done here
    else
    {
      callback(error, resolvedPayload);
    }
  }.bind(this));
}

/**
 * Emits normalized event with payload and extracted send method.
 * Also tries to emit specific type event
 *
 * @param {string} event - event handle
 * @param {object} payload - current payload object
 */
function emitter(event, payload)
{
  // get proper name
  var normalized = normalize(event);

  // notify listeners
  this.emit(normalized, payload, (payload.user || {}).send);

  // notify listeners of the specific type
  if (payload.type)
  {
    this.emit([normalized, payload.type].join('.'), payload, (payload.user || {}).send);
  }
}
