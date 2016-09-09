module.exports = attach;

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
