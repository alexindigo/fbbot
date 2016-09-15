var hyperquest = require('hyperquest');

module.exports = request;

/**
 * Wraps hyperquest to provide extra convenience
 * with handling responses
 *
 * @param   {string} url - url to request
 * @param   {object} [options] - request options
 * @param   {function} callback - invoked on response
 * @returns {stream.Duplex} - request stream
 */
function request(url, options, callback)
{
  if (typeof options == 'function')
  {
    callback = options;
    options  = {};
  }

  return hyperquest(url, options, function(error, response)
  {
    // set body
    response.body = '';

    if (error)
    {
      callback(error, response);
      return;
    }

    // accumulate response body
    response.on('data', function(data)
    {
      response.body += data.toString();
    });

    response.on('end', function()
    {
      callback(null, response);
    });
  });
}
