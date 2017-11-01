import Client, {
	guild
} from '../../client/client';
import Command from '../command';
import Module from '../module';
import Config from '../../config/config';
import * as Discord from 'discord.js';

/**
 * @type {Discord.TextChannel}
 */
const welcomeChannel = guild().channels.get(Config.welcomeModule.welcomeChannel);

/**
 * The welcome module.
 */
const Welcome = new Module({
	name: 'Welcome',
	description: 'The welcome module to help newcomers get to know the server.',
	prefix: '.hi ',
	channels: [Config.welcomeModule.ticketChannel],
	showHelp: false
});

/**
 * Place a hook that announces the new member on the announcement channel,
 * showing them around the corner and telling them to read the rules before
 * continuing.
 */
Client.on('guildMemberAdd', async member => {
	/**
	 * @type {Discord.Message}
	 */
	const message = await welcomeChannel.send(`Chào mừng ${member} đến với mái nhà Tổng Hợp trên Discord! Xin hãy đọc qua ${guild().channels.get(Config.welcomeModule.rulesChannel)} và làm theo hướng dẫn để bắt đầu tham gia vào các hoạt động của server!`);
	await message.react('🎶');
});

/**
 * The role assignment request,
 * after this, the member gets all the roles required to see all channels they want.
 */
Welcome.add('iam', new Command({
	description: 'Register yourself as a member of the HSGS Discord.',
	handler: async message => {
		const role = message.args;
		if (!Config.welcomeModule.mapRoles.has(role)) {
			await message.reply('Mã khối không hợp lệ. Xin hãy thử lại! :sob:');
			return;
		}
		const roleID = Config.welcomeModule.mapRoles.get(role);
		// Assign both the respective role and member role.
		await guild().members.get(message.author.id).addRoles([roleID, Config.welcomeModule.memberRole], 'New member role assignment.');
	}
}));