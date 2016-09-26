var qs       = require('querystring')
  , path     = require('path')
  , http     = require('http')
  , util     = require('util')
  , glob     = require('glob')
  , merge    = require('deeply')
  , assert   = require('assert')
  , asynckit = require('asynckit')
  , agnostic = require('agnostic')
  , request  = require('../lib/request.js')
  , shared   = require('./shared-tests.js')
    // turn on array combination
  , mergeArrays = {
    useCustomAdapters: merge.behaviors.useCustomAdapters,
    'array'          : merge.adapters.arraysCombine
  }
  ;

// expose suite methods
var common = module.exports =
{
  server: {
    endpoint: '/webhook',
    port    : 56789
  },

  api:
  {
    port: 45678
  },

  // fbbot instance
  fbbot: {
    pageAccessToken: 'ESDQmINhZC1osBACNOI8aQWoOYR4vsMzxZAyeW8baL0xUFdmu123McxihZAZAMHZBhiubQWE0kRIzoA7RTVflZAOmAlBMNUhRdoXoQo0UGocJZAJkijqr4PwJ878onSJu0oigzaBEQCfkAPR2PAIXZB8qLjuegan7qTDl5cmntoBqxOwABAB',
    verifyToken    : 'wear sunscreen'
  },

  // shared methods
  setupTests     : setupTests,
  iterateRequests: iterateRequests,
  iterateSendings: iterateSendings,
  sendRequest    : sendRequest,
  sendHandshake  : sendHandshake,
  startApiServer : startApiServer,

  // test handshake
  handshakes: {
    // sends proper fields
    'ok': {
      query: {
        'hub.verify_token': 'wear sunscreen',
        'hub.challenge'   : '' + Math.random()
      }
    },

    // sends unacceptable data
    'bad': {
      query: {
        'hub.verify_token': 'XXXXX-wrong-token-XXXXX'
      },
      error: 'Error, wrong validation token'
    }
  },

  // test requests
  requests: {},

  // test api calls
  sendings: {}
};

// load request fixtures
glob.sync(path.join(__dirname, './fixtures/incoming/*.json')).forEach(function(file)
{
  var name = path.basename(file, '.json');

  common.requests[name] = require(file);

  // augment expected
  if ('+expected' in common.requests[name])
  {
    common.requests[name].expected = merge.call(mergeArrays, common.requests[name].body, common.requests[name]['+expected']);
  }
});

// load sending fixtures
glob.sync(path.join(__dirname, './fixtures/outgoing/*.json')).forEach(function(file)
{
  var name = path.basename(file, '.json');
  common.sendings[name] = require(file);
});

/**
 * Adds tests to the provided instance
 *
 * @param {object} fbbot - fbbot instance
 * @param {string} payloadType - payload's type to test
 * @param {object} subject - test request subject
 * @param {object} t - test suite instance
 * @param {function} callback - invoked after all tests for this payload type is done
 */
function setupTests(fbbot, payloadType, subject, t, callback)
{
  // run request wide tests
  shared.perRequest(fbbot, payloadType, subject, t, callback);

  // iterate over entries-messages
  subject.expected.entry.forEach(function(entry)
  {
    entry.messaging.forEach(function(message)
    {
      shared.perMessage(fbbot, payloadType, message, t);
    });
  });
}

/**
 * Iterates over requests asynchronously
 *
 * @param {function} iterator - iterator function
 */
function iterateRequests(iterator)
{
  asynckit.serial(common.requests, iterator, function noop(err){ assert.ifError(err, 'expects all requests to finish without errors'); });
}

/**
 * Iterates over sendings asynchronously
 *
 * @param {function} iterator - iterator function
 */
function iterateSendings(iterator)
{
  asynckit.serial(common.sendings, function(item, type, callback)
  {
    // each item is an array by itself
    asynckit.serial(item, function(test, id, cb)
    {
      // differentiate elements within same type
      iterator(test, type + '-' + id, cb);
    }, callback);

  }, function noop(err){ assert.ifError(err, 'expects all sendings to finish without errors'); });
}

/**
 * Sends request with specified method, headers and body
 * to the simulated backend
 *
 * @param {string} type - type of the request
 * @param {function} callback - invoke on response from the simulated server
 */
function sendRequest(type, callback)
{
  if (!common.requests[type]) throw new Error('Unsupported request type: ' + type + '.');

  var url  = 'http://localhost:' + common.server.port + common.server.endpoint;
  var body = JSON.stringify(common.requests[type].body);

  var options = {
    method  : 'POST',
    headers : common.requests[type].headers
  };
  options.headers['content-length'] = body.length;

  request(url, options, callback).write(body);
}

/**
 * Sends handshake based on the requested typed
 *
 * @param {string} type - handshake type, `ok` or `bad`
 * @param {function} callback - invoked on response
 */
function sendHandshake(type, callback)
{
  if (!common.handshakes[type]) throw new Error('Unsupported handshake type: ' + type + '.');

  var url   = 'http://localhost:' + common.server.port + common.server.endpoint;
  var query = qs.stringify(common.handshakes[type].query);

  request(url + '?' + query, callback);
}

/**
 * Start API server with common port and augmented request handler
 *
 * @param   {function} handler - request handler
 * @param   {function} callback - invoked after server has started
 */
function startApiServer(handler, callback)
{
  var server = http.createServer(agnostic(handler)).listen(common.api.port, function()
  {
    // supply endpoint to the consumer
    var tailoredOptions = util._extend(common.fbbot, {apiUrl: 'http://localhost:' + common.api.port + '/?access_token='});
    callback(tailoredOptions, server.close.bind(server));
  });
}
