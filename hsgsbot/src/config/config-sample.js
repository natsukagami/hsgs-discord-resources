export default {
	connection: {
		/**
		 * The bot token, used as a login method
		 * @type {String}
		 */
		token: '',
		/**
		 * The owner's user id, to grant full permissions
		 * @type {String}
		 */
		ownerId: '',
		/**
		 * The only guild the bot will serve. Yay!
		 * @type {String}
		 */
		guildId: '',
		/**
		 * The announcement channel id
		 * @type {String}
		 */
		announcementChannelId: ''
	},
	/**
	 * These configurations will be overrided by module-specific configs.
	 */
	general: {
		/**
		 * Users with these roles have access to all administrative commands
		 * @type {Array}
		 */
		adminRoles: [''],
		/**
		 * Users with these roles have access to all moderative commands
		 * @type {Array}
		 */
		modRoles: [''],
		/**
		 * Users with these roles have access to all usage commands
		 * @type {Array}
		 */
		usageRoles: [''],
		/**
		 * Debugging channel
		 */
		debugChannel: ''
	},
	welcomeModule: {
		/**
		 * The channel that receives ticket requests.
		 */
		ticketChannel: '',
		/**
		 * The channel that sends welcome notes.
		 */
		welcomeChannel: '',
		/**
		 * The rules channel.
		 */
		rulesChannel: '',
		/**
		 * Map of the `iam` parameters with respective roles.
		 * @type {Map<string, string>}
		 */
		mapRoles: new Map(),
		/**
		 * The specific 'All-members' role.
		 */
		memberRole: ''
	}
};