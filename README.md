# fbbot [![NPM Module](https://img.shields.io/npm/v/fbbot.svg?style=flat)](https://www.npmjs.com/package/fbbot)

Minimal framework/SDK for facebook messenger bots. BYOS (Bring Your Own Server).

[![Linux Build](https://img.shields.io/travis/alexindigo/fbbot/master.svg?label=linux:0.12-6.x&style=flat)](https://travis-ci.org/alexindigo/fbbot)
[![MacOS Build](https://img.shields.io/travis/alexindigo/fbbot/master.svg?label=macos:0.12-6.x&style=flat)](https://travis-ci.org/alexindigo/fbbot)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/fbbot/master.svg?label=windows:0.12-6.x&style=flat)](https://ci.appveyor.com/project/alexindigo/fbbot)

[![Coverage Status](https://img.shields.io/coveralls/alexindigo/fbbot/master.svg?label=code+coverage&style=flat)](https://coveralls.io/github/alexindigo/fbbot?branch=master)
[![Dependency Status](https://img.shields.io/david/alexindigo/fbbot/master.svg?style=flat)](https://david-dm.org/alexindigo/fbbot)
[![bitHound Overall Score](https://www.bithound.io/github/alexindigo/fbbot/badges/score.svg)](https://www.bithound.io/github/alexindigo/fbbot)

[![express](https://img.shields.io/badge/express-tested-brightgreen.svg?style=flat)](http://expressjs.com)
[![hapi](https://img.shields.io/badge/hapi-tested-brightgreen.svg?lstyle=flat)](http://hapijs.com)
[![restify](https://img.shields.io/badge/restify-tested-brightgreen.svg?style=flat)](http://restify.com)
[![http](https://img.shields.io/badge/http-tested-brightgreen.svg?style=flat)](https://nodejs.org/api/http.html)

## Work In Progress

- TODO: fetch user info middleware
- TODO: initialization actions (welcome page, menu, white-listing, etc)

## Examples

### Listening for messages

```javascript
// also works with `hapi`, `restify` and built-in `http`
var express = require('express');
var Fbbot = require('fbbot');

var app = express();
var fbbot = new Fbbot({token: '...', secret: '...'});

// plug-in fbbot
// It will also listen for GET requests to authorize fb app.
app.all('/webhook', fbbot.requestHandler);
// assuming HTTPS is terminated elsewhere,
// or you can use standard express https capabilities
app.listen(8080);

// catching messages
fbbot.on('message', function(message, send)
{
  // message.type <-- type of the message (text, attachment, quick_reply, sticker, etc)
  // message.user <-- user object
  // message.text <-- text for text messages
  // message.attachments <-- list of attachments if available
  // send <-- send method with baked in user.id `send(fbbot.<message_type>, <payload>, <callback>)`
});

// handle only text messages
fbbot.on('message.text', function(message, send)
{
  // message.user <-- user object
  // message.text <-- text for text messages
  // send <-- send method with baked in user.id `send(fbbot.<message_type>, <payload>, <callback>)`
});

fbbot.on('postback', function(postback, send)
{
  // postback.user <-- user object
  // postback.payload <-- parsed payload
  // send <-- send method with baked in user.id `send(fbbot.<message_type>, <payload>, <callback>)`
});
```

### Adding middleware

```javascript
var express = require('express');
var Fbbot = require('fbbot');

var app = express();
var fbbot = new Fbbot({token: '...', secret: '...'});

// plug-in fbbot
app.all('/webhook', fbbot.requestHandler);
// assuming HTTPS is terminated elsewhere,
// or you can use standard express https capabilities
app.listen(8080);

fbbot.use('message', function(payload, callback)
{
  // do something with the payload, async or sync
  setTimeout(function()
  {
    payload.fooWasHere = true;
    // pass it to callback
    callback(null, payload);
  }, 500);
});

// catching messages
fbbot.on('message', function(message, send)
{
  // modified message payload
  message.fooWasHere; // true
});

```

More middleware examples could be found in [incoming](incoming/) folder.

### Sending messages to user

Here are two ways of sending messages, using per-instance fbbot.send method,
or the one tailored to the user, provided to the event handlers.

```javascript
var express = require('express');
var Fbbot = require('fbbot');

var app = express();
var fbbot = new Fbbot({token: '...', secret: '...'});

// plug-in fbbot
app.all('/webhook', fbbot.requestHandler);
// assuming HTTPS is terminated elsewhere,
// or you can use standard express https capabilities
app.listen(8080);

// "standalone" send function
// send reguar text message
fbbot.send(1234567890, fbbot.TEXT, 'Hi there!', function(error, response)
{
  // error <!-- message composition error or transport error
  // response <-- response from the remote server
});

// sending messages as reply
fbbot.on('message', function(message, send)
{
  // tailored to the user
  // callback is optional
  send(fbbot.IMAGE, 'https://petersapparel.com/img/shirt.png');

  // also message type tailored methods are available
  send.image('https://petersapparel.com/img/shirt.png');
});
```

More details could be found in [test-send.js](test/test-send.js).

Check out [test folder](test/fixtures) for available options.

### Logging

```javascript
var Fbbot = require('fbbot');
var fbbot = new Fbbot({token: '...', secret: '...', logger: myCustomLogger});

// turn on logging
// uses `bole` out of the box
Fbbot.logger.output({
  level : 'info',
  stream: process.stdout
});

```

## License

FBBot is released under the [MIT](LICENSE) license.
