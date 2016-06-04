#!/usr/bin/env node

'use strict';

/**
 * Bot launcher script.
 *
 * @authors Nikita Karpenkov <nikita.karpenkov@gmail.com>, Luciano Mammino <lucianomammino@gmail.com>
 */

var SyneBot = require('../lib/synebot');

/**
 * Environment variables used to configure the bot:
 *
 *  BOT_API_KEY : the authentication token to allow the bot to connect to your slack organization. You can get your
 *      token at the following url: https://<yourorganization>.slack.com/services/new/bot (Mandatory)
 *  BOT_NAME: the username you want to give to the bot within your organisation.
 */
var token = process.env.BOT_API_KEY || require('../token');
var name = process.env.BOT_NAME;

var handlers = [];

var HelloHandler = function Constructor() {
	this.answer = 'I\'m alive!';
};

HelloHandler.prototype.handle = function(message, context, replyCallback) {
  	context.state = context.state || { messageNumber: 0 };
  	context.state.messageNumber++;
	replyCallback(this.answer + ' #' + context.state.messageNumber, null, true);
};

handlers.push(new HelloHandler());

var synebot = new SyneBot({
    token: token,
    name: name
}, handlers);

synebot.run();
