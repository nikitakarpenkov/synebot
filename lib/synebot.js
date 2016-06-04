'use strict';

var util = require('util');
var Bot = require('slackbots');

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "synebot")
 *
 * @param {object} settings
 * @constructor
 *
 * @authors Nikita Karpenkov <nikita.karpenkov@gmail.com>, Luciano Mammino <lucianomammino@gmail.com>
 */
var SyneBot = function Constructor(settings, handlers) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'synebot';
    this.handlers = handlers;
    this.contexts = {};

    this.user = null;
    this.db = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(SyneBot, Bot);

/**
 * Run the bot
 * @public
 */
SyneBot.prototype.run = function () {
    SyneBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
SyneBot.prototype._onStart = function () {
    this._loadBotUser();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
SyneBot.prototype._onMessage = function (message) {
    console.log(message);
    if (this._isChatMessage(message) &&
        !this._isFromSyneBot(message) &&
        (this._isMentioningSyneBot(message) || 
        this._isDirectConversation(message))
    ) {
        this._invokeHandlers(message);
    }
};

/**
 * Replyes to a given message
 * @param {object} originalMessage
 * @private
 */
SyneBot.prototype._reply = function (originalMessage, replyText, replyParams) {
    replyParams = replyParams || { as_user: true };
    this.postMessage(originalMessage.channel, replyText, replyParams);
};

/**
 * Invokes message handlers
 * @param {object} originalMessage
 * @private
 */
SyneBot.prototype._invokeHandlers = function (message) {
    var self = this;
    this.handlers.forEach(function(handler, handlerIndex) {
        var context = self._getMessageContext(message, handlerIndex);
        handler.handle(message, context, function(replyText, replyParams, pending) {
            self._reply(message, replyText, replyParams);
            if (!pending && self.contexts[context.hash]) {
                delete self.contexts[context.hash];
            } else if (pending && !self.contexts[context.hash]) {
                self.contexts[context.hash] = context;
            }
        });
    });
};

/**
 * Returns message context object
 * @param {object} message
 * @private
 */
SyneBot.prototype._getMessageContext = function (message, handlerIndex) {
    var messageHash = message.user + '@' + message.channel + ':' + handlerIndex;
    var context = this.contexts[messageHash];
    if (!context) {
        context = {
            hash: messageHash,
            isDirect: this._isDirectConversation(message),
            isChannel: this._isChannelConversation(message),
            isGroup: this._isGroupConversation(message),
            user: this._getUserById(message.user),
            channel: null,
            group: null,
            messages: []
        };
        if (context.isChannel) {
            context.channel = this._getChannelById(message.channel);
        } else if (context.isGroup) {
            context.group = this._getGroupById(message.channel);
        }
    }
    context.messages.push(message);
    return context;
};

/**
 * Loads the user object representing the bot
 * @private
 */
SyneBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
    console.log(this.user);
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SyneBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is a private conversation message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SyneBot.prototype._isDirectConversation = function (message) {
    return typeof message.channel === 'string'
            && message.channel[0] === 'D';
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SyneBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string'
            && message.channel[0] === 'C';
};

/**
 * Util function to check if a given real time message object is directed to a group
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SyneBot.prototype._isGroupConversation = function (message) {
    return typeof message.channel === 'string'
            && message.channel[0] === 'G';
};

/**
 * Util function to check if a given real time message is mentioning Synebot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SyneBot.prototype._isMentioningSyneBot = function (message) {
    return message.text.indexOf('<@' +  this.user.id + '>') > -1;
};

/**
 * Util function to check if a given real time message has been sent by the Synebot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SyneBot.prototype._isFromSyneBot = function (message) {
    return message.bot_id === this.user.profile.bot_id;
};

/**
 * Util function to get the user given its id
 * @param {string} userId
 * @returns {Object}
 * @private
 */
SyneBot.prototype._getUserById = function (userId) {
    return this.users.filter(function (item) {
        return item.id === userId;
    })[0];
};

/**
 * Util function to get the channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
SyneBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

/**
 * Util function to get the group given its id
 * @param {string} groupId
 * @returns {Object}
 * @private
 */
SyneBot.prototype._getGroupById = function (groupId) {
    return this.groups.filter(function (item) {
        return item.id === groupId;
    })[0];
};

module.exports = SyneBot;
