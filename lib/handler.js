var asynckit     = require('asynckit')
  , canonical    = {
    'attachments': 'attachment',
    'sticker_id' : 'sticker'
  }
  , steps        = {
    'payload'   : 'entry',
    'entry'     : 'messaging',
    // just because of the structure of the payload
    // it needs to have extra step to get to the message types
    'messaging' : ['message'],
    // order here is important, not just alphabetical, although I did try to keep it nice
    // some messages contain `text` and other fields, and shouldn't be treated as separate type
    // examples: attachments#fallback (with url), quick_reply (with payload), sticker_id+attachments#image (sticker)
    // TODO: add 'echo', 'read'
    'message'    : [ 'sticker_id', 'attachments', 'delivery', 'postback', 'quick_reply', 'text' ],
    'attachments': { type: [ 'audio', 'fallback', 'file', 'image', 'location' ] }
  }
  ;

// TODO: rename the file and the function
module.exports = handlePayload;

/**
 * Iterates asynchronously over payload entries
 *
 * @param {string} [name] - node name of the payload, skipped for the top level one
 * @param {object} payload - initial payload object from facebook messenger
 * @param {function} callback - invoked upon error or when all entries were processed
 */
function handlePayload(name, payload, callback)
{
  // check for optional argument
  if (typeof name == 'object')
  {
    callback = payload;
    payload  = name;
    name     = 'payload'; // middleware.entryPoint;
  }

console.log('\n\n ------ START >>> [', name, '] >>> ', payload, '\n\n');

  this.logger.debug({message: 'TBW something about raw payload'});

  if (typeof payload != 'object')
  {
    this.logger.error({message: 'payload is not an Object', name: name, payload: payload});
    callback(new Error('payload <', name, '> is not an Object'));
    return;
  }

  // run global middleware on initial payload object
  this.run(normalizeName(name), payload, function(error, resolvedPayload)
  {
    var nextStep = steps[name];

//console.log('- After middleware', name, '-vs-', nextStep, 'vs', normalizeName(name), '-with-', error);

    if (error)
    {
      this.logger.error({message: 'middleware ran into an error', error: error, name: name, nextStep: nextStep, originalPayload: payload, resolvedPayload: resolvedPayload});
      callback(error, resolvedPayload);
      return;
    }

    this.logger.info({message: 'TBW - all middleware are ok'});

    // notify listeners
    this.emit(normalizeName(name), resolvedPayload);

    // proceed further
    processNextStep.call(this, name, nextStep, resolvedPayload, callback);
  }.bind(this));
}


function processNextStep(current, nextStep, payload, callback)
{
  var type;

console.log('\n --------- NEXT STEP:', nextStep, ', from:', current, '--with--', payload, '\n ---------- \n\n');

  this.logger.debug({message: 'TBW something next step'});

  if (!nextStep)
  {
    this.logger.debug({message: 'no further steps defined, stop right here', current: current, payload: payload});
    callback(null, payload);
    return;
  }

  if (typeof payload != 'object')
  {
    this.logger.error({message: 'payload is not an Object', current: current, nextStep: nextStep, payload: payload});
    callback(new Error('payload from <', current, '> for <', nextStep, '> is not an Object'));
    return;
  }

  // adjust payload conditionally
  // if there are deeper branches for the current `name`
  // traverse payload deeper
  payload = (current in steps && current in payload) ? payload[current] : payload;

  // 1:1
  if (typeof nextStep == 'string')
  {
    handleBranch.call(this, nextStep, payload[nextStep], callback);
  }
  // 1:many
  else if (Array.isArray(nextStep) && (type = nextStep.find(function(prop){ return prop in payload; })))
  {
    // handle it as `name.type`, example: `message.attachments`
    // keep original payload, since `type` is just a marker within the branch
    handleBranch.call(this, type, payload[type], callback);
  }
  // 1:many:many (with properties)
  else if (typeof nextStep == 'object')
  {
    asynckit.parallel(nextStep, function(types, prop, cb)
    {
      // make sure it's always array
      types = Array.isArray(types) ? types : [types];

      // try different props, one by one
      asynckit.parallel(types, function(propType, done)
      {
        handleBranch.call(this, prop, propType, payload, done);
      }.bind(this), cb);

    }.bind(this), callback);
  }
  else
  {
    // error - unrecognized
    // or type from 1:many couldn't be found
console.log('\n\n----------------------- OOPS ------------[', nextStep, '-vs-', payload, ']---------\n\n');
    this.logger.debug({message: 'TBW - explain why nothing is found and why it is ok'});

  }


}

function handleBranch(name, value, payload, callback)
{
  if (arguments.length == 3)
  {
    callback = payload;
    payload  = value;
    value    = undefined;
  }

  if (Array.isArray(payload))
  {
    // process all entries in parallel
    // supposedly they are unrelated to each other on this level of details
    asynckit.parallel(payload, handleBranch.bind(this, name, value), callback);
  }
  // only proceed if `payload[name]` equals `value`
  else if (value)
  {
    if (payload[name] === value)
    {
      // it uses value as payload branch name
      // for better differentiation
      handlePayload.call(this, value, payload, callback);
    }
    else
    {
      this.logger.debug({message: 'TBW - nothing serious here, ok to have non-matching values'});
    }
  }
  // just pass it along
  else
  {
    handlePayload.call(this, name, payload, callback);
  }
}

/**
 * normalizes name to use within public interfaces
 *
 * @param   {string} name - internal protocol naming
 * @returns {string} - normalized "public" naming
 */
function normalizeName(name)
{
  return canonical[name] || name;
}











/**
 * Iterates asynchronously over entires
 *
 * @param {object} payload - initial payload object from facebook messenger
 * @param {function} callback - invoked upon error or when all entries were processed
 */
function process(payload, callback)
{
console.log('\n\n - payload', payload, '\n\n');
  this.logger.debug({message: 'TBW'});

  if (typeof payload != 'object')
  {
    callback(new Error('payload is not an Object'));
    return;
  }

  // run global middleware on initial payload object
  this.run(payload, function(error, resolvedPayload)
  {
console.log('After middleware');

    if (error)
    {
      callback(err, entry);
      return;
    }

    if (!Array.isArray(resolvedPayload.entry))
    {
      callback(new Error('payload.entry is not an Array'));
      return;
    }

    this.logger.info({message: 'TBW'});

    // notify listeners
    this.emit('payload', resolvedPayload);

    // process all entries in parallel
    // supposedly they are unrelated to each other
    asynckit.parallel(resolvedPayload.entry, entryHandler.bind(this), callback);
  }.bind(this));
}

/**
 * Handles single entry
 *
 * @param {object} entry - single entry object
 * @param {function} callback - invoked upon error or when all processing is done
 */
function entryHandler(entry, callback)
{
console.log('\n\n - entry + ', entry, '\n\n');
  this.logger.debug({message: 'TBW'});

  this.run('entry', entry, function(err, resolvedEntry)
  {
    if (err)
    {
      callback(err, entry);
      return;
    }

    if (!Array.isArray(resolvedEntry.messaging))
    {
      callback(new Error('payload.entry[].messaging is not an Array'));
      return;
    }

    this.logger.info({message: 'TBW'});

    // notify listeners
    this.emit('entry', resolvedEntry);

    // process all messages in parallel
    // supposedly they are unrelated to each other
    asynckit.parallel(resolvedEntry.messaging, messageHandler.bind(this), callback);
  }.bind(this));
}

/**
 * Handles single message
 *
 * @param {object} message - single message object
 * @param {function} callback - invoked upon error or when all processing is done
 */
function messageHandler(message, callback)
{
console.log('\n\n - message + ', message, '\n\n');
  this.logger.debug({message: 'TBW'});

  this.run('message', message, function(err, resolvedMessage)
  {
    if (err)
    {
      callback(err, message);
      return;
    }

    this.logger.info({message: 'TBW'});

    // notify listeners
    this.emit('message', resolvedMessage);

    // process all messages in parallel
    // supposedly they are unrelated to each other
//    asynckit.parallel(entry.messaging, messageHandler.bind(this), callback);
  }.bind(this));
}
