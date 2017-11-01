const Discord = require('discord.js');
const escapeStringRegexp = require('escape-string-regexp');

import Command from './command';
import debug from './debug';
/**
 * Routes the commands in their specific paths
 * @extends Command
 */
export default class Router extends Command {
	/**
	 * @constructor
	 * @param {Object} opts
	 * @param {string} opts.name The router name
	 * @param {string} opts.description The router's description
	 * @param {Array.<string>} opts.roles An array of role IDs, only people with these
	 * roles are able to access the router
	 * @param {(string|Array.<string>)} opts.channels An array of channel IDs, only
	 * channels listed can provoke the router.
	 */
	constructor({
		name,
		description,
		roles = [],
		channels = 'all',
		showHelp = true
	}) {
		super({
			description: description,
			roles: roles,
			channels: channels
		});
		/**
		 * The name of the router, displayed in help
		 * @type {string}
		 */
		this.name = name;
		/**
		 * Routers, listed in help
		 * @type {Object.<string, Router>}
		 */
		this.routers = {};
		/**
		 * Commands, listed in help
		 * @type {Object.<string, Command>}
		 */
		this.commands = {};
		/**
		 * A series of handlers to be fetched and executed
		 * @type {Array.<Function>}
		 */
		this.handlers = [];
		/**
		 * The debugger function.
		 * @type {Function}
		 */
		this.debug = debug('Youmu:router:' + this.name);
		if (!showHelp) return;
		// Implements a `help` command
		this.add(['help', 'h'], new Command({
			description: 'Show this help.',
			handler: message => {
				const embed = new Discord.RichEmbed();
				embed
					.setTitle(name)
					.setDescription(description + '\nAvailable commands:');
				for (let route in this.routers)
					if (this.routers[route].canUse(message)) {
						embed.addField(`Submodule \`${message.prefix}${route}\``, this.routers[route].description);
					}
				for (let cmd in this.commands)
					if (this.commands[cmd].canUse(message)) {
						embed.addField(`${cmd.split('|||').map(p => `\`${message.prefix}${p}\``).join(' / ')}`, this.commands[cmd].description.replace(/\$\$_PREFIX_\$\$/g, message.prefix));
					}
				message.reply('', {
					embed: embed
				});
			}
		}));
	}
	// Overridable methods
	/**
	 * Gets the regex built from the given pattern.
	 * The default creates a 'word-then-space/EOLN' regex, but Module overrides this.
	 * @param {string} pattern The pattern given to build the regex
	 * @return {RegExp} the regex object
	 * @private
	 */
	getRegex(pattern) {
		return new RegExp('^' + escapeStringRegexp(pattern) + '(\\s|$)');
	}
	// Public methods
	/**
	 * Add a router/command/handler into the route chain with a pattern
	 * @param {(string|Array.<string>)} patterns The pattern(s) to fetch the command into executing
	 * @param {(Router|Command|Function)} obj The object to be added
	 * @returns {Router} The chainable `this`
	 */
	add(patterns, obj) {
		let fun = null;
		if (typeof patterns === 'string') patterns = [patterns];
		if (obj instanceof Router || obj instanceof Command) {
			(obj instanceof Router ? this.routers : this.commands)[patterns.join('|||')] = obj;
			fun = (message, next) => obj.handle(message, next);
		} else if (obj instanceof Function) {
			fun = obj;
		} else throw new Error('Cannot add an object that\'s not a Router, Command nor Handler');
		fun = this.__wrapPattern(fun, patterns.map(p => this.getRegex(p)));
		this.handlers.push(fun);
		return this;
	}
	/**
	 * Add a router/command/handler into the route chain without a pattern
	 * @param {(Router|Command|Function)} obj The object to be added
	 * @returns {Router} The chainable `this`
	 */
	use(obj) {
		let fun = null;
		if (obj instanceof Router || obj instanceof Command) {
			fun = (message, next) => obj.handle(message, next);
		} else if (obj instanceof Function) {
			fun = obj;
		} else throw new Error('Cannot add an object that\'s not a Router, Command nor Handler');
		this.handlers.push(fun);
		return this;
	}
	/**
	 * The overriden handle property getter. Wraps `__route` function.
	 * @return {Function} The handle function
	 */
	get handle() {
		this.handler = (message, next) => this.__route(message, next);
		return super.handle;
	}
	// Private methods
	__route(message, next, index = 0) {
		if (index >= this.handlers.length) {
			next();
			return;
		}
		this.handlers[index](message, () => {
			this.__route(message, next, index + 1);
		});
	}
	/**
	 * Wraps a handler function within pattern check
	 * @param {Function} handler The handler function
	 * @param {(string|Array.<string>)} patterns The pattern(s) to be checked against
	 * @return {Function} The pattern-wrapped handler function
	 * @private
	 */
	__wrapPattern(handler, patterns) {
		return (message, next) => {
			if (!('args' in message)) throw new Error('Message has no `args`?');
			for (let pattern of patterns) {
				if (message.args.search(pattern) === 0) {
					message.prefix = message.path;
					message.path += message.args.match(pattern)[0];
					message.args = message.args.replace(pattern, '');
					this.debug('"' + message.prefix + '" / "' + message.path + '" / "' + message.args + '"');
					return handler(message, next);
				}
			}
			return next();
		};
	}
}