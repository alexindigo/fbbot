var normalize = require('../lib/normalize.js');

module.exports = {

  // list of receive steps
  steps: {
    ''           : 'message',
    'message'    : ['attachment', 'quick_replies'],
    'attachment' : 'payload',
    'payload'    : 'elements'
  },

  linkParent: linkParent,
  middleware: middleware,
  emitter   : emitter,
  prefix    : 'send'
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
  // skip if it's empty string
  if (normalized)
  {
    result.__proto__[normalized] = parentPayload;
  }

  return result;
}

/**
 * Traverse middleware for outgoing flow
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

    if (payload['template_type'])
    {
      normalizeType = normalize(payload['template_type']);
      this._run([normalized, normalizeType].join('.'), resolvedPayload, callback);
    }
    else if (payload.type)
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
  this.emit(normalized, payload);

  // notify listeners of the specific type
  if (payload['template_type'])
  {
    this.emit([normalized, payload['template_type']].join('.'), payload);
  }
  else if (payload.type)
  {
    this.emit([normalized, normalize(payload.type)].join('.'), payload);
  }
}
