# fbbot [![NPM Module](https://img.shields.io/npm/v/fbbot.svg?style=flat)](https://www.npmjs.com/package/fbbot)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Falexindigo%2Ffbbot.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Falexindigo%2Ffbbot?ref=badge_shield)

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
    - [`send.message`](#sendmessage)
    - [`send.markSeen`](#sendmarkseen)
    - [`send.typingOn`](#sendtypingon)
    - [`send.typingOff`](#sendtypingoff)
    - [`send.text`](#sendtext)
    - [`send.image`](#sendimage)
    - [`send.audio`](#sendaudio)
    - [`send.video`](#sendvideo)
    - [`send.file`](#sendfile)
    - [`send.generic`](#sendgeneric)
    - [`send.button`](#sendbutton)
    - [`send.receipt`](#sendreceipt)
    - [`send.quickReplies`](#sendquickreplies)
  - [Message Types](#message-types)
    - [`MESSAGE`](#message)
    - [`MARK_SEEN`](#mark_seen)
    - [`TYPING_ON`](#typing_on)
    - [`TYPING_OFF`](#typing_off)
    - [`TEXT`](#text)
    - [`IMAGE`](#image)
    - [`AUDIO`](#audio)
    - [`VIDEO`](#video)
    - [`FILE`](#file)
    - [`GENERIC`](#generic)
    - [`BUTTON`](#button)
    - [`RECEIPT`](#receipt)
    - [`QUICK_REPLIES`](#quick_replies)
  - [Hooks](#hooks)
    - [Incoming](#incoming)
    - [Outgoing](#outgoing)
- [Roadmap](#roadmap)
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

Will automatically stringify payload object for _postback_ buttons, since Messenger Platform expects it to be a string.

```javascript
fbbot.send(String|Object user, [String type ,] [String|Array|Object payload ,] [Function callback]);
```

- `user`: user id or phone number, provided via string (user id) or object with `id` or `phone_number` properties.
- `type`: *(optional)* message type, if not provided, will fallback to `Fbbot#MESSAGE` type.
- `payload`: *(optional)* payload object for the chosen message type, not expected for `MARK_SEEN`, `TYPING_ON` and `TYPING_OFF` types.
- `callback`: *(optional)* standard error-back pattern, with `response` object as second argument.

List of available message types could be found [below](#message-types).

Also `send` method with backed in user id available as second argument for event listeners:

```javascript
send([String type ,] [String|Array|Object payload ,] [Function callback]);
```

Along with convenience methods per supported message type:

```javascript
send.<type>([Object payload ,] [Function callback]);
```

### Convenience Methods

#### `send.message`

Sends payload as raw message.

```javascript
send.message(Object payload [, Function callback])
```

Example payload could be found [below](#message).

#### `send.markSeen`

Marks last message as read.

```javascript
send.markSeen([Function callback])
```

#### `send.typingOn`

Turns typing indicators on.

```javascript
send.typingOn([Function callback])
```

#### `send.typingOff`

Turns typing indicators off.

```javascript
send.typingOff([Function callback])
```

#### `send.text`

Sends text message. Expects text string as payload. Will truncate provided string to 320 characters, as per Messenger Platform limitations.

```javascript
send.text(String text [, Function callback])
```

#### `send.image`

Sends image attachment. Expects string with image url as payload.

```javascript
send.image(String url [, Function callback])
```

#### `send.audio`

Sends audio attachment. Expects string with url to audio file as payload.

```javascript
send.audio(String url [, Function callback])
```

#### `send.video`

Sends video attachment. Expects string with url to video file as payload.

```javascript
send.video(String url [, Function callback])
```

#### `send.file`

Sends generic file attachment. Expects string with url to a file as payload.

```javascript
send.file(String url [, Function callback])
```

#### `send.generic`

Sends generic template attachment. Expects array of "card" objects as payload. Will send first 10 elements, as per Messenger Platform limitations.

```javascript
send.generic(Array elements [, Function callback])
```

Example payload could be found [below](#generic).

#### `send.button`

Sends button template attachment. Expects object with text and array of buttons as payload. Will send first 3 buttons, as per Messenger Platform limitations.

```javascript
send.button(Object payload [, Function callback])
```

Example payload could be found [below](#button).

#### `send.receipt`

Sends receipt template attachment. Expects receipt object as payload. Will send first 100 item elements, as per Messenger Platform limitations.

```javascript
send.receipt(Object payload [, Function callback])
```

Example payload could be found [below](#receipt).

#### `send.quickReplies`

Sends quick replies object. Expects object with text and array of quick_reply buttons as payload. Will send first 10 buttons, as per Messenger Platform limitations. Will automatically stringify payload property.

```javascript
send.quickReplies(Object payload [, Function callback])
```

Example payload could be found [below](#quick_replies).

### Message Types

Available as properties of the Fbbot instance, like `fbbot.MESSAGE` and `fbbot.MARK_SEEN`.

#### `MESSAGE`

Treats payload as raw message.

Example payload:

```json
{
  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [{
        "title": "Welcome to Peter's Hats",
        "item_url": "https://petersfancybrownhats.com",
        "image_url": "https://petersfancybrownhats.com/company_image.png",
        "subtitle": "We've got the right hat for everyone.",
        "buttons": [{
          "type": "web_url",
          "url": "https://petersfancybrownhats.com",
          "title": "View Website"
        }, {
          "type": "postback",
          "title": "Start Chatting",
          "payload": {
            "developer": ["defined", "payload"],
          }
        }]
      }]
    }
  }
}
```

#### `MARK_SEEN`

Doesn't require payload, corresponds to `mark_seen` sender action.

#### `TYPING_ON`

Doesn't require payload, corresponds to `typing_on` sender action.

#### `TYPING_OFF`

Doesn't require payload, corresponds to `typing_off` sender action.

#### `TEXT`

Treats payload as text message. Expects text string as payload. Will truncate provided string to 320 characters, as per Messenger Platform limitations.

#### `IMAGE`

Treats payload as image attachment. Expects string with image url as payload.

#### `AUDIO`

Treats payload as audio attachment. Expects string with url to audio file as payload.

#### `VIDEO`

Treats payload as video attachment. Expects string with url to video file as payload.

#### `FILE`

Treats payload as generic file attachment. Expects string with url to a file as payload.

#### `GENERIC`

Treats payload as generic template attachment. Expects array of "card" objects as payload. Will send first 10 elements, as per Messenger Platform limitations.

Example payload:

```json
[
  {
    "title": "Welcome to Peter's Hats",
    "item_url": "https://petersfancybrownhats.com",
    "image_url": "https://petersfancybrownhats.com/company_image.png",
    "subtitle": "We've got the right hat for everyone.",
    "buttons": [{
      "type": "web_url",
      "url": "https://petersfancybrownhats.com",
      "title": "View Website"
    }, {
      "type": "postback",
      "title": "Start Chatting",
      "payload": "DEVELOPER_DEFINED_PAYLOAD"
    }]
  },

  {
    "title": "Welcome to Peter's Boots",
    "item_url": "https://petersokredboots.com",
    "image_url": "https://petersokredboots.com/company_image.png",
    "subtitle": "We've got the left boots for everyone.",
    "buttons": [{
      "type": "web_url",
      "url": "https://petersokredboots.com",
      "title": "View Website"
    }, {
      "type": "postback",
      "title": "Start Chatting",
      "payload": {
        "developer": ["defined", "payload"],
      }
    }]
  }
]
```

#### `BUTTON`

Treats payload as button template attachment. Expects object with text and array of buttons as payload. Will send first 3 buttons, as per Messenger Platform limitations.

Example payload:

```json
{
  "text": "What do you want to do next?",
  "buttons":
  [
    {
      "type": "web_url",
      "url": "https://petersapparel.parseapp.com",
      "title": "Show Website"
    },
    {
      "type": "postback",
      "title": "Start Chatting",
      "payload": {
        "developer": ["defined", "payload"],
      }
    }
  ]
}
```

#### `RECEIPT`

Treats payload as receipt template attachment. Expects receipt object as payload. Will send first 100 item elements, as per Messenger Platform limitations.

Example payload:

```json
{
  "recipient_name": "Stephane Crozatier",
  "order_number": "12345678902",
  "currency": "USD",
  "payment_method": "Visa 2345",
  "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
  "timestamp": "1428444852",
  "elements": [{
    "title": "Classic White T-Shirt",
    "subtitle": "100% Soft and Luxurious Cotton",
    "quantity": 2,
    "price": 50,
    "currency": "USD",
    "image_url": "http://petersapparel.parseapp.com/img/whiteshirt.png"
  }, {
    "title": "Classic Gray T-Shirt",
    "subtitle": "100% Soft and Luxurious Cotton",
    "quantity": 1,
    "price": 25,
    "currency": "USD",
    "image_url": "http://petersapparel.parseapp.com/img/grayshirt.png"
  }],
  "address": {
    "street_1": "1 Hacker Way",
    "street_2": "",
    "city": "Menlo Park",
    "postal_code": "94025",
    "state": "CA",
    "country": "US"
  },
  "summary": {
    "subtotal": 75.00,
    "shipping_cost": 4.95,
    "total_tax": 6.19,
    "total_cost": 56.14
  },
  "adjustments": [{
    "name": "New Customer Discount",
    "amount": 20
  }, {
    "name": "$10 Off Coupon",
    "amount": 10
  }]
}
```

#### `QUICK_REPLIES`

Treats payload as quick replies object. Expects object with text and array of quick_reply buttons as payload. Will send first 10 buttons, as per Messenger Platform limitations. Will automatically stringify payload property.

Example payload:

```json
{
  "text": "Pick a color:",
  "quick_replies": [{
    "content_type": "text",
    "title": "Red",
    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
  }, {
    "content_type": "text",
    "title": "Green",
    "payload": {
      "custom": "payload",
      "for": "quick_reply"
    }
  }, {
    "content_type": "location"
  }]
}
```

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

## Roadmap

- add `send.batch` method, for sending series of messages, with smart `notification_type`s.
- support for `read` and `echo` notification
- add `airline` templates
- fetch user info middleware
- initialization actions (welcome page, menu, white-listing, etc)

## License

FBBot is released under the [MIT](LICENSE) license.


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Falexindigo%2Ffbbot.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Falexindigo%2Ffbbot?ref=badge_large)