import Client, {
	guild
} from '../../client/client';
import Command from '../command';
import Module from '../module';
import Config from '../../config/config';
import * as Discord from 'discord.js';

/**
 * The welcome module.
 */
const Roles = new Module({
	name: 'Roles',
	description: 'Giúp mọi người có thể tham gia / rời khỏi các nhóm riêng biệt của server!',
	prefix: '.roles ',
	channels: [Config.general.botChannel],
	showHelp: true
});

const RolesMap = Config.rolesModule.mapRoles;
const nonHSGSRole = Config.rolesModule.nonHSGSRole;

/**
 * The role toggle request.
 * Simply invoke it with a role name to gain/remove it.
 */
Roles.add('gimme', new Command({
	description: 'Yêu cầu một Role nào đó cho mình, hoặc huỷ nó nếu bạn đã có sẵn.',
	handler: async message => {
		const roleid = message.args;
		if (!RolesMap.has(roleid)) {
			await message.reply('Mã của Role không hợp lệ. Xin hãy thử lại! :sob:');
			return;
		}
		const role = RolesMap.get(roleid);
		const user = guild().members.get(message.author.id);
		if (role.requireHSGS && user.roles.has(nonHSGSRole)) {
			// The user is not a HSGS student.
			await message.reply(':negative_squared_cross_mark: Bạn không được phép sử dụng role này, nó chỉ dành cho học sinh của HSGS!');
			return;
		}
		// Assign both the respective role and member role.
		if (!user.roles.has(role.id)) {
			await guild().members.get(message.author.id).addRole(role.id, 'User-requested role assignment.');
			await message.react('➕');
		} else {
			await guild().members.get(message.author.id).removeRole(role.id, 'User-requested role assignment.');
			await message.react('➖');
		}
		// Reacts to the message to inform that the role has been assigned.
		await message.react('👍');
	}
}));

/**
 * List all the available roles.
 * Note that this only lists the roles that the user is allowed to assign.
 */
Roles.add('list', new Command({
	description: 'Liệt kê các Role bạn có thể gán cho bản thân!',
	handler: async message => {
		const user = guild().members.get(message.author.id);
		const roles = Array.from(RolesMap.entries()).filter(v => !v[1].requireHSGS || !user.roles.has(nonHSGSRole));
		const msg = roles.map(r => `\`${r[0]}\`: ${r[1].description}`).join('\n');
		await message.reply('Đây là các Role bạn có thể yêu cầu:\n\n' + msg);
	}
}));