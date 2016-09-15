var qs       = require('querystring')
  , path     = require('path')
  , glob     = require('glob')
  , merge    = require('deeply')
  , assert   = require('assert')
  , asynckit = require('asynckit')
  , request  = require('../lib/request.js')
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

  // fbbot instance
  fbbot: {
    pageAccessToken: 'ESDQmINhZC1osBACNOI8aQWoOYR4vsMzxZAyeW8baL0xUFdmu123McxihZAZAMHZBhiubQWE0kRIzoA7RTVflZAOmAlBMNUhRdoXoQo0UGocJZAJkijqr4PwJ878onSJu0oigzaBEQCfkAPR2PAIXZB8qLjuegan7qTDl5cmntoBqxOwABAB',
    verifyToken    : 'wear sunscreen'
  },

  // shared methods
  sendRequest    : sendRequest,
  iterateRequests: iterateRequests,
  sendHandshake  : sendHandshake,

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
  requests: {}
};

// load request fixtures
glob.sync(path.join(__dirname, './fixtures/*.json')).forEach(function(file)
{
  var name = path.basename(file, '.json');

  common.requests[name] = require(file);

  // augment expected
  if ('+expected' in common.requests[name])
  {
    common.requests[name].expected = merge.call(mergeArrays, common.requests[name].body, common.requests[name]['+expected']);
  }
});

/**
 * Iterates over requests asynchronously
 *
 * @param {function} iterator - iterator function
 */
function iterateRequests(iterator)
{
  asynckit.serial(common.requests, iterator, function noop(err){ assert.ifError(err, 'expects to finish without errors'); });
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
