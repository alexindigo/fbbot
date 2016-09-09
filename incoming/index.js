var attach = require('../lib/attach.js');

var filters = {

  'messaging': [
    require('./user_init.js')
  ],

  'message': [
    require('./type_cast.js')
  ]
};

module.exports = attach.bind(null, filters);
