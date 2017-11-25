/**
 * The discord.js Client
 * @module Client
 */

import Config from '../config/config';
import * as Discord from 'discord.js';

const debug = require('debug')('HSGSBot:server');

/**
 * The discord client
 * @type {Discord.Client}
 */
const Client = new Discord.Client();

Client.login(Config.connection.token)
	.then(() => {
		debug('Connected to Discord');
	})
	.catch(err => {
		debug('Can\'t connect to Discord: ' + err);
		throw err;
	});

/**
 * Gets the current guild
 * @return {Discord.Guild} The guild configured
 */
export function guild() {
	return Client.guilds.get(Config.connection.guildId);
}
export default Client;