var qs = require('querystring');

module.exports = verifyEndpoint;

/**
 * Verifies endpoint by replying with the provided challenge
 *
 * @private
 * @param {EventEmitter} request - incoming http request object
 * @param {function} respond - http response function
 */
function verifyEndpoint(request, respond)
{
  var challenge;

  if (typeof request.query == 'string')
  {
    request.query = qs.parse(request.query);
  }

  if (typeof request.query == 'object'
    && ((request.query['hub.verify_token'] === this.credentials.secret)
        // for hapi@10 and restify/express with queryParser check for `hub` object
    || (typeof request.query.hub == 'object' && request.query.hub['verify_token'] === this.credentials.secret)
    )
  )
  {
    challenge = request.query['hub.challenge'] || (request.query.hub ? request.query.hub.challenge : null);

    this.logger.debug({message: 'Successfully verified', challenge: challenge});
    respond(challenge);
    return;
  }

  this.logger.error({message: 'Unable to verify endpoint', query: request.query});
  respond(400, 'Error, wrong validation token');
}
