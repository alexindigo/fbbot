# fbbot

Minimal framework/SDK for facebook messenger bots. BYOS (Bring Your Own Server).


## Examples

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
