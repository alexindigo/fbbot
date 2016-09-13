# fbbot

Minimal framework/SDK for facebook messenger bots. BYOS (Bring Your Own Server).


## Examples

### Listening for messages

```javascript
// also works with `hapi`, `restify` and built-in `http`
var express = require('express');
var Fbbot = require('fbbot');

var app = express();
var fbbot = new Fbbot({token: '...', secret: '...'});

// plug-in fbbot
app.use('/webhook', fbbot.requestHandler);
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
