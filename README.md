# fbbot [![NPM Module](https://img.shields.io/npm/v/fbbot.svg?style=flat)](https://www.npmjs.com/package/fbbot)

Minimal framework/SDK for facebook messenger bots. BYOS (Bring Your Own Server).

[![Linux Build](https://img.shields.io/travis/alexindigo/fbbot/master.svg?label=linux:0.12-6.x&style=flat)](https://travis-ci.org/alexindigo/fbbot)
[![MacOS Build](https://img.shields.io/travis/alexindigo/fbbot/master.svg?label=macos:0.12-6.x&style=flat)](https://travis-ci.org/alexindigo/fbbot)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/fbbot/master.svg?label=windows:0.12-6.x&style=flat)](https://ci.appveyor.com/project/alexindigo/fbbot)

[![Coverage Status](https://img.shields.io/coveralls/alexindigo/fbbot/master.svg?label=code+coverage&style=flat)](https://coveralls.io/github/alexindigo/fbbot?branch=master)
[![Dependency Status](https://img.shields.io/david/alexindigo/fbbot/master.svg?style=flat)](https://david-dm.org/alexindigo/fbbot)
[![bitHound Overall Score](https://www.bithound.io/github/alexindigo/fbbot/badges/score.svg)](https://www.bithound.io/github/alexindigo/fbbot)

## Work In Progress

- Missing send method (with templates)
- Missing fetch user info middleware

## Examples

### Listening for messages

```javascript
// also works with `hapi`, `restify` and built-in `http`
var express = require('express');
var Fbbot = require('fbbot');

var app = express();
var fbbot = new Fbbot({token: '...', secret: '...'});

// plug-in fbbot
app.all('/webhook', fbbot.requestHandler);
// assuming HTTPS is terminated elsewhere,
// or you can use standard express https capabilities
app.listen(8080);

// catching messages
fbbot.on('message', function(message)
{
  // message.type <-- type of the message (text, attachment, quick_reply, sticker, etc)
  // message.user <-- user object
  // message.text <-- text for text messages
  // message.attachments <-- list of attachments if available
});

// handle only text messages
fbbot.on('message.text', function(message)
{
  // message.user <-- user object
  // message.text <-- text for text messages
});

fbbot.on('postback', function(postback)
{
  // postback.user <-- user object
  // postback.payload <-- parsed payload
});
```

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
