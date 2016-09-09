var clone    = require('deeply')
  , asynckit = require('asynckit')
  , steps    = {
    'payload'   : 'entry',
    'entry'     : 'messaging',
    'messaging' : 'message',
    'message'   : 'attachments'
  }
  ;

// TODO: rename the file and the function
module.exports = handlePayload;

/**
 * Iterates asynchronously over payload entries
 *
 * @param {string} [branch] - branch name of the payload, skipped for the top level one
 * @param {object} payload - initial payload object from facebook messenger
 * @param {function} callback - invoked upon error or when all entries were processed
 */
function handlePayload(branch, payload, callback)
{
  // check for optional argument
  if (typeof branch == 'object')
  {
    callback = payload;
    payload  = branch;
    branch   = 'payload'; // middleware.entryPoint;
  }

console.log('\n\n ------ START >>> [', branch, '] >>> ', payload, '\n\n');

  this.logger.debug({message: 'TBW something about raw payload'});

  if (typeof payload != 'object')
  {
    this.logger.error({message: 'payload is not an Object', branch: branch, payload: payload});
    callback(new Error('payload <', branch, '> is not an Object'));
    return;
  }

  // run global middleware on initial payload object
  this.run(branch, clone(payload), function(error, resolvedPayload)
  {
    var nextStep = steps[branch];

console.log('- After middleware', branch, '-vs-', nextStep, '-with-', error);

    if (error)
    {
      this.logger.error({message: 'middleware ran into an error', error: error, branch: branch, nextStep: nextStep, originalPayload: payload, resolvedPayload: resolvedPayload});
      callback(error, resolvedPayload);
      return;
    }

    this.logger.info({message: 'TBW - all middleware are ok'});

    // notify listeners
    this.emit(branch, resolvedPayload);
console.log('\n _____ EMIT', branch, '-with-', resolvedPayload);

    if (resolvedPayload.type)
    {
      // notify listeners of the specific type
      this.emit([branch, resolvedPayload.type].join('.'), resolvedPayload);
console.log('\n _____ EMIT+', [branch, resolvedPayload.type].join('.'));
    }

    // proceed further
    processNextStep.call(this, nextStep, resolvedPayload, callback);
  }.bind(this));
}


function processNextStep(nextStep, payload, callback)
{
console.log('\n --------- NEXT STEP:', nextStep, '--with--', payload, '\n ---------- \n\n');

  this.logger.debug({message: 'TBW something next step'});

  if (typeof payload != 'object')
  {
    this.logger.error({message: 'payload is not an Object ', nextStep: nextStep, payload: payload});
    callback(new Error('payload for <', nextStep, '> is not an Object'));
    return;
  }

  if (!nextStep || !(nextStep in payload))
  {
    this.logger.debug({message: 'no further steps defined, stop right here', nextStep: nextStep, payload: payload});
    callback(null, payload);
    return;
  }

  // proceed to the next step
  payload = payload[nextStep];

  // iterate over arrays
  if (Array.isArray(payload))
  {
    // process all entries in parallel
    // supposedly they are unrelated to each other on this level of details
    asynckit.parallel(payload, handlePayload.bind(this, nextStep), callback);
  }
  else
  {
    handlePayload.call(this, nextStep, payload, callback);
  }
}
