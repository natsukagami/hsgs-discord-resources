/**
 * Provides a debugging function for Youmu
 * @module Debug
 */
import Config from '../config/config';
import Client from '../client/client';
const owner = Client.users.get(Config.connection.ownerId);
const debugChannel = Client.channels.get(Config.general.debugChannel);
const debug = require('debug');

/**
 * Creates a debugging function with the given name
 * @param  {string} name The debugging function's name
 * @return {Function}    The debugging function
 */
export default function Debugger(name) {
	const d = debug(name);
	/**
	 * The debugging function
	 * @param  {string} message The debug message
	 * @param  {Number} [criticalLevel=0] The critical level [Info, Warning, Error, Fatal]
	 * @param  {Number} [messageTime=0] The time for the message to be present. Defaults to live forever (30s for info)
	 */
	const sendDebug = async function (message, criticalLevel = 0, messageTime = 0) {
		if (typeof message !== 'string') message = require('util').inspect(message);
		const criticalMessage = ['Info', 'Warning', owner + ', Error', owner + ', Fatal Error'];
		d(criticalMessage[criticalLevel] + ': ' + message);
		message = await debugChannel.send(
			criticalMessage[criticalLevel] + ' from **' + name + '**' + '\n```' + message + '```', {
				split: {}
			});
		if (criticalLevel === 0) messageTime = messageTime || 30000;
		if (messageTime) message.delete(messageTime);
	};
	return sendDebug;
}