module.exports = attach;

/**
 * [attach description]
 *
 * @param {object} filters - list of filters per step (event)
 * @param {function} instance - filter instance to attach to an event (step)
 */
function attach(filters, instance)
{
  Object.keys(filters).forEach(function(step)
  {
    filters[step].forEach(function(filter)
    {
      instance.use(step, filter);
    });
  });
}
