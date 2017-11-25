const escapeStringRegexp = require('escape-string-regexp');

import debug from './debug';
import Client from '../client/client';
import Router from './router';
// const Config = require('../config/config');

/**
 * A starting point message receiver and router.
 * @extends Command
 * @extends Router
 */
export default class Module extends Router {
	/**
	 * @constructor
	 * @param {Object} opts
	 * @param {string} opts.name The module name
	 * @param {string} opts.description The module's description
	 * @param {string} opts.prefix The module's prefix command
	 * @param {Array.<string>} opts.roles An array of role IDs, only people with these
	 * roles are able to access the module
	 * @param {(string|Array.<string>)} opts.channels An array of channel IDs, only
	 * channels listed can provoke the module.
	 *
	 */
	constructor({
		name,
		description,
		prefix,
		roles = [],
		channels = 'all',
		showHelp = true
	}) {
		super({
			name: name,
			description: description,
			roles: roles,
			channels: channels,
			showHelp: showHelp
		});
		/**
		 * The prefix of the module
		 * @example '!'
		 * @type {string}
		 */
		this.prefix = prefix;
		/**
		 * Overrides the debug to change the name
		 * @type {Function}
		 */
		this.debug = debug('Youmu:module:' + this.name);
		// Hooks the client message event
		Client.on('message', message => {
			if (message.author.id === Client.user.id) return; // Ignore self
			message.channel.fetchMessage(message.id)
				.then(async mes => {
					mes.args = mes.content;
					mes.prefix = '';
					mes.path = '';
					try {
						this.handle(mes, () => {});
					} catch (e) {
						this.debug(e);
					}
				});
		});
		// Indicates that the module is ready
		// Turn this off, it's annoying
		// Client.guild().channels
		// 	.get(Config.connection.announcementChannelId).send(`Module **${this.name}** ready! For more information please type \`${this.prefix}help\` ${(typeof this.channels === 'string' ? '' : `on ${this.channels.map(c => Client.guild().channels.get(c)).join(' or ')}`)}!`);
		this.debug('Loaded');
		// Ignore those are in DnD or Invisible!
		this.handlers.unshift((message, next) => {
			if (message.author.presence.status === 'dnd' || message.author.presence.status === 'offline') {
				return message.author.send(':no_entry_sign: You are not allowed to make any command while in Do not Disturb or Invisible... Please, do not lie to me, nor do you ignore me :sob:.').then(() => message.delete());
			}
			next();
		});
	}
	/**
	 * The overriden handle function for module, which performs the pattern check
	 * before executing.
	 * @return {Function} The handler function
	 */
	get handle() {
		return this.__wrapPattern(super.handle, [new RegExp('^' + escapeStringRegexp(this.prefix))]);
	}
}