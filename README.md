# fbbot [![NPM Module](https://img.shields.io/npm/v/fbbot.svg?style=flat)](https://www.npmjs.com/package/fbbot)

Minimal framework/SDK for facebook messenger bots. BYOS (Bring Your Own Server).

[![patform@1.2](https://img.shields.io/badge/messenger_platform-v1.2-brightgreen.svg?style=flat)](https://developers.facebook.com/docs/messenger-platform)

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

## Install

```
npm install --save fbbot
```

## Table of Contents

<!-- TOC -->
- [Examples](#examples)
  - [Listening for messages](#listening-for-messages)
  - [Adding middleware](#adding-middleware)
  - [Sending messages to user](#sending-messages-to-user)
  - [Logging](#logging)
- [API](#api)
  - [Fbbot#use](#fbbotuse)
  - [Fbbot#on](#fbboton)
  - [Fbbot#send](#fbbotsend)
    - [Convenience Methods](#convenience-methods)
  - [Message Types](#message-types)
  - [Hooks](#hooks)
    - [Incoming](#incoming)
    - [Outgoing](#outgoing)
- [TODO](#todo)
- [License](#license)

<!-- TOC END -->

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

Check out [test folder](test/fixtures) for available options.

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

## API

### Fbbot#use

Adds middleware for both incoming and outgoing flows. Outgoing hooks prefixed with `send`. Each middleware handler function expected to invoke callback with payload object, modified or not.

```javascript
fbbot.use([String hook ,] Function handler)
```

If no `hook` specified, provided function will be applied to entire incoming payload.

- `hook`: *(optional)* hook handle to attach middleware handler to.
- `handler`: middleware handler, expected to have following signature:

```javascript
handler(Object payload, Function callback)
```

- `payload`: chunk of the payload corresponding to the attached hook.
- `callback`: standard error-back pattern, with updated `payload` as second argument.

List of available hooks could be found [below](#hooks).

### Fbbot#on

Adds event listener for both incoming and outgoing flows. Outgoing events (hooks) prefixed with `send`. Each event listener function will receive `send` method tailored for the event in question.

```javascript
fbbot.on(String hook, Function listener)
```

- `hook`: hook handle to attach event listener to.
- `listener`: event listener, expected to have following signature:

```javascript
listener(Object payload, Function send)
```

- `payload`: chunk of the payload corresponding to the attached hook.<sup>1</sup>
- `send`: function being tailored specifically for the event – baked in user id where it's available,
and set of convenience methods for sending specific message types, [listed below](#convenience-methods).

<sup>1</sup> Message payload augmented with `type` property and reference `user` object. All payloads have prototype object with reference to the "parent" object.

List of available hooks could be found [below](#hooks).

### Fbbot#send

Sends provided payload to the specified (by either `id` or `phone_number`) user,
reconstructs platform expected payload based on the message type and minimal data set.

```javascript
fbbot.send(String|Object user, [String type ,] [Object payload ,] [Function callback]);
```

- `user`: user id or phone number, provided via string (user id) or object with `id` or `phone_number` properties.
- `type`: *(optional)* message type, if not provided, will fallback to `Fbbot#MESSAGE` type.
- `payload`: *(optional)* payload object for the chosen message type, not expected for `MARK_SEEN`, `TYPING_ON` and `TYPING_OFF` types.
- `callback`: *(optional)* standard error-back pattern, with `response` object as second argument.

List of available message types could be found [below](#message-types).

Also `send` method with backed in user id available as second argument for event listeners.

```javascript
fbbot.send([String type ,] [Object payload ,] [Function callback]);
```

Along with convenience methods per supported message type.

```javascript
fbbot.send.<type>([Object payload ,] [Function callback]);
```

#### Convenience Methods

- `send.message`: 

### Message Types

- `MESSAGE`: raw message payload.

### Hooks

Same hooks work (applied) for both middleware and event listeners.

#### Incoming

Available incoming hooks (in the following order):

- `payload`: *(default, if no hook specified)* applied to entire payload.
- `entry`: applied per each entry of the payload.
- `messaging`: applied per each messaging element of the payload.
- `delivery`: applied to delivery notifications.
- `postback`: applied to postback messages.
- `message`: applied to regular messages.
  - `message.attachment`: applied to attachment type messages only.
  - `message.quick_reply`: applied to quick reply type messages only.
  - `message.sticker`: applied to sticker type messages only.
  - `message.text`: applied to text type messages only.
- `quick_reply`: applied to quick reply payload.
- `attachment`: applied per each attachment.
  - `attachment.audio`: applied to audio attachments only.
  - `attachment.fallback`: applied to fallback attachments only.<sup>2</sup>
  - `attachment.file`: applied to file attachments only.
  - `attachment.image`: applied to image attachments only.
  - `attachment.location`: applied to location attachments only.

<sup>2</sup> Some undocumented case when user sends only link without any other text in the message,
your bot would receive as dual quantum state message, which would have regular text field with the link as text,
as well as attachment object with type `fallback` with `url` field and prefetched `title` of the linked page.
Example of such payload could be found in [message-attachment-fallback-text.json](test/fixtures/incoming/message-attachment-fallback-text.json).

Sample payloads could be found in [incoming fixtures](test/fixtures/incoming) folder.

#### Outgoing

- `send`: applied to the entire outgoing payload.
- `send.message`: applied to all outgoing messages (status updates, like `typing_on` are not messages).
- `send.attachment`: applied to outgoing attachments.
  - `send.attachment.audio`: applied to outgoing audio attachments only.
  - `send.attachment.file`: applied to outgoing file attachments only.
  - `send.attachment.image`: applied to outgoing image attachments only.
  - `send.attachment.video`: applied to outgoing video attachments only.
  - `send.attachment.template`: applied to templated attachments.
- `send.quick_reply`: applied per each outgoing quick reply element.
- `send.payload`: applied to payload objects within outgoing message.
  - `send.payload.generic`: applied to payload objects with generic template.
  - `send.payload.receipt`: applied to payload objects with receipt template.
  - `send.payload.button`: applied to payload objects with button template.
- `send.element`: applied per each element of the outgoing payload.
- `send.button`: applied per button options within message, either button template or buttons option within other templates.
  - `send.button.web_url`: applied to buttons with urls only.
  - `send.button.postback`: applied to postback buttons only.
  - `send.button.phone_number`: applied to call buttons only.
  - `send.button.element_share`: applied to share buttons only.<sup>3</sup>
  - `send.button.payment`: applied to buy buttons only.<sup>4</sup>

<sup>3</sup> The [Share Button](https://developers.facebook.com/docs/messenger-platform/send-api-reference/share-button) only works with the Generic Template.

<sup>4</sup> The [Buy Button](https://developers.facebook.com/docs/messenger-platform/send-api-reference/buy-button) only works with the Generic Template and it must be the first button.

## TODO

- add `send.batch` method, for sending series of messages, with smart `notification_type`s.
- support for `read` and `echo` notification
- add `airline` templates
- fetch user info middleware
- initialization actions (welcome page, menu, white-listing, etc)

## License

FBBot is released under the [MIT](LICENSE) license.
