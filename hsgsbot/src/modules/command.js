import Client from '../client/client';

/***
 * Handler design
 * handler function(message, next)
 * => Command class (handler + description + roles + channel)
 * => Router class (Command + routing + name)
 * => Module class (Router + base-routing)
 */

/**
 * A command is basically a message handler, with a description and a role limiter.
 */
export default class Command {
	/**
	 * @constructor
	 * @param {Object} opts
	 * @param {string} opts.description What does the command do?
	 * @param {Function} opts.handler The handler function
	 * @param {Array.<string>} opts.roles An array of role IDs, only people with these
	 * roles are able to access the command. An empty array defaults to everyone.
	 * @param {(string|Array.<string>)} opts.channels An array of channel IDs, only
	 * channels listed can provoke the command.
	 */
	constructor({
		description,
		handler,
		roles = [],
		channels = 'all'
	}) {
		/**
		 * The description of the command
		 * @type {string}
		 */
		this.description = description;
		/**
		 * A function that takes (message, args) as arguments
		 * @type {Function}
		 */
		this.handler = /* Command.__wrapTyping(handler) */ handler;
		/**
		 * An array of role IDs, only people with these roles are able to access the command
		 * @type {Array<string>}
		 */
		this.roles = roles;
		/**
		 * An array of channel IDs, only channels listed can provoke the command.
		 * If set to 'all', all channels are accepted. If set to 'text/dm', Guild/DM is accepted.
		 * @type {Array<string>|string}
		 */
		this.channels = channels;
	}
	/**
	 * Gets the command's handler function.
	 * @param {Message} message The message object.
	 * @param {Function} next The `next` function.
	 */
	get handle() {
		return Command.wrapPermissions(this.handler, this.roles, this.channels);
	}
	/**
	 * Can `message.author` use the command?
	 * @param {Message} message The message
	 * @return {boolean}
	 */
	canUse(message) {
		return Command.wrapPermissions(() => true, this.roles, this.channels)(message, () => false);
	}
	static isRole(author, roles = []) {
		return Command.__wrapPermission(() => true, roles)({
			author: author
		}, () => false);
	}
}

/**
 * Wraps a handler function within permissions and channels check
 * @param {Function} handler the handler function
 * @param {Array.<string>} roles The string of roles IDs that have permission to use the command
 * @param  {(Array.<string>|string)} channels Channel specification as above.
 * @return {Function} The permission-wrapped handler function
 */
Command.wrapPermissions = (handler, roles, channels) => {
	return Command.__wrapPermission(Command.__wrapChannel(handler, channels), roles);
};
/**
 * Wraps a handler function within permission check
 * @param {Function} handler the handler function
 * @param {Array.<string>} roles The string of roles IDs that have permission to use the command
 * @return {Function} The permission-wrapped handler function
 * @private
 */
Command.__wrapPermission = (handler, roles) => {
	return (message, next) => {
		if (roles.length === 0) return handler(message, next);
		for (let role of Client.guild().members.get(message.author.id).roles.array().map(p => p.id)) {
			if (roles.indexOf(role) !== -1) {
				return handler(message, next);
			}
		}
		return next();
	};
};
/**
 * Wraps a handler function within channel check.
 * @param  {Function} handler  The handler function
 * @param  {(Array.<string>|string)} channels Channel specification as above.
 * @return {Function}          The wrapped handler function.
 * @private
 */
Command.__wrapChannel = (handler, channels) => {
	return (message, next) => {
		if (typeof channels === 'string') {
			if (channels === 'all' || channels === message.channel.type) {
				return handler(message, next);
			}
		} else
			for (let channel of channels) {
				if (message.channel.id === channel) {
					return handler(message, next);
				}
			}
		return next();
	};
};

Command.__wrapTyping = handler => {
	return (message, next) => {
		message.channel.startTyping();
		let res = null;
		try {
			res = handler(message, next);
		} catch (e) {
			throw e;
		} finally {
			message.channel.stopTyping();
		}
		return res;
	};
};