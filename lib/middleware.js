var pipeline = require('./pipeline.js');

// placeholder for "catch-all" middleware
// when no event name been supplied
var entryPoint = 'payload';

module.exports = {
  use : use,
  run : run,
  // convenience names
  entryPoint : entryPoint
};

/**
 * Adds provided middleware to the stack,
 * with optional list of events
 *
 * @this  fbbot
 * @param {string|array} [events] - list of events to associate middleware with
 * @param {function} middleware - request/event handler
 */
function use(events, middleware)
{
  // if no middleware supplied assume it's single argument call
  if (!middleware)
  {
    middleware = events;
    events     = null;
  }

  // make it uniform
  events = normalizeEvents(events);

  // store middleware per event
  events.forEach(function(e)
  {
    (this.stack[e] = this.stack[e] || []).push(middleware);

    // make mark in history
    this.logger.debug({message: 'TBW'});
  }.bind(this));
}

/**
 * Runs middleware in the stack for the provided events with passed payload
 *
 * @this  fbbot
 * @param {string|array} [events] - list of events to determine middleware set to iterate over
 * @param {object} payload - event payload to pass along to middleware
 * @param {function} callback - invoked after (if) all middleware been processed
 */
function run(events, payload, callback)
{
  // if no callback supplied assume it's two arguments call
  if (!callback)
  {
    callback = payload;
    payload  = events;
    events   = null;
  }

  // make it uniform
  events = normalizeEvents(events);

  // apply events/middleware asynchronously and sequentially
  pipeline(events, payload, function(e, data, cb)
  {
    if (!Array.isArray(this.stack[e]))
    {
      this.logger.debug({message: 'TBW'});
      cb(null, payload);
      return;
    }

    pipeline(this.stack[e], data, tryCall, cb);
  }.bind(this), callback);
}

/**
 * Runs handler with provided data
 * wrapped into try/catch
 *
 * @param {function} handler - handler function to run
 * @param {object} data - data to pass to the handler
 * @param {function} callback - invoked after handler finishes, or with caught error
 */
function tryCall(handler, data, callback)
{
  try {
    handler(data, callback);
  } catch (e) {
    callback(e);
  }
}

/**
 * Normalizes provided events
 * to keep `add` and `apply` on the same page
 *
 * @private
 * @param   {null|string|array} events - events to normalize
 * @returns {array} - normalized list of events
 */
function normalizeEvents(events)
{
  // start with converting falsy events into catch-all placeholder
  events = events || entryPoint;

  if (!Array.isArray(events))
  {
    events = [events];
  }

  // return shallow copy
  return events.concat();
}
