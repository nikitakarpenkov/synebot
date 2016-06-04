# SyneBot is a [Synebo](http://synebo.com/) Slack Bot

SyneBot is a simple extendable Slack bot written in javascript. It listens for direct messages and @synebot mentions on channels or groups and fires a set of specified *handlers* to interact user. Synebot is based on the Michail Mokrushin's [slack-bot-api](https://github.com/mishk0/slack-bot-api) node.js library and uses Luciano Mammino's [bot example](https://github.com/lmammino/norrisbot) code.

## Usage

``` javascript
var SyneBot = require('../lib/synebot');

var token = process.env.BOT_API_KEY || require('../token');
var name = process.env.BOT_NAME;

var handlers = [];

// push your handlers here

var synebot = new SyneBot({
    token: token,
    name: name
}, handlers);

synebot.run();
```

## Handlers

Handler is an object implementing *handle()* function, which takes three arguments: original message, context variable and reply callback function. If handler decides to answer the message, it invokes reply callback function.

### Context variable

For more complex commands, multiple messages may be necessary to send a response, particularly if the bot needs to collect additional information from the user. Synebot provides a *context* object that is used to store together several user messages and handler state data, into a cohesive unit. Context is a persistent variable related to a specific combination of user, channel and handler. Contexts add features like the ability to ask a question, queue several messages at once, and end the interaction.

``` javascript
{
  hash: 'string' // identifying context (message.user + '@' + message.channel + ':' + handlerIndex)
  isDirect: boolean // true if this is direct message
  isChannel: boolean // true if this is channel conversation
  isGroup: boolean // true if this is group (private channel) conversation
  user: {} // user object
  channel: {} // channel object
  group: {} // group object
  messages: [] // array of context-related user's messages
  state: {} // handler state object
}
```

### Reply callback function

Reply callback function takes three parameters: response text, response parameters (optional) and boolean variable, indicating that conversation is still in progress and it is necessary to keep context until next relevant message.

### Handler example

``` javascript
var HelloHandler = function Constructor() {
	this.answer = 'I\'m alive!';
};

HelloHandler.prototype.handle = function(message, context, replyCallback) {
  	context.state = context.state || { messageNumber: 0 };
  	context.state.messageNumber++;
	  replyCallback(this.answer + ' #' + context.state.messageNumber, null, true);
};

handlers.push(new HelloHandler());
```


## Getting the API token for your Slack channel

To allow the SyneBot to connect your Slack channel you must provide him an API key. To retrieve it you need to add a new Bot in your Slack organization by visiting the following url: https://*yourorganization*.slack.com/services/new/bot, where *yourorganization* must be substituted with the name of your organization (e.g. https://*loige*.slack.com/services/new/bot). Ensure you are logged to your Slack organization in your browser and you have the admin rights to add a new bot.

You will find your API key under the field API Token, copy it in a safe place and get ready to use it.


## Configuration

The SyneBot is configurable through environment variables. There are several variable available:

| Environment variable | Description |
|----------------------|-------------|
| `BOT_API_KEY` | this variable is mandatory and must be used to specify the API token needed by the bot to connect to your Slack organization |
| `BOT_NAME` | the name of your bot, it’s optional and it will default to synebot |


## Launching the bot from source

If you downloaded the source code of the bot you can run it using NPM with:

```bash
$ npm start
```

Don't forget to set your `BOT_API_KEY` environment variable bedore doing so. Alternatively you can also create a file called `token.js` in the root folder and put your token there (you can use the `token.js.example` file as a reference).

## License

Licensed under [MIT License](LICENSE). © Nikita Karpenkov.
