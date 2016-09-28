var attach = require('../lib/attach.js');

var filters = {

  'send.button.postback': [
    require('./button_postback.js')
  ],

  'send.quick_reply': [
    require('./quick_reply.js')
  ]

};

module.exports = attach.bind(null, filters);
