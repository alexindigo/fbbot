var async = require('asynckit/lib/async');

module.exports = pipeline;

/**
 * Pipelines provided payload through the list of of item via handler
 *
 * @param   {array} list - items to iterate over
 * @param   {object} payload - object to pass to pass iteratees
 * @param   {function} handler - function to invoke for each item/payload iteration
 * @param   {function} callback - invoked after all item were processed
 */
function pipeline(list, payload, handler, callback)
{
  var item;

  if (!list.length)
  {
    callback(null, payload);
    return;
  }

  list = list.concat();
  item = list.shift();

  // pipeline it
  handler(item, payload, async(function(err, updatedPayload)
  {
    if (err)
    {
      callback(err, updatedPayload);
      return;
    }

    // rinse, repeat
    pipeline(list, updatedPayload, handler, callback);
  }));
}
