const { Events } = require('discord.js');
const Guild = require('../../database/guild.js');
const { replaceVars } = require('../../func/system/variables.js');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member, client) {
		// Поиск сервера в базе данных
		const guild = member.guild;
		const g = await Guild.findOne({ guildID: guild.id });
		if (!g) return;
		if (g.welcome.channelID != '-1') {
			// Получение канала
			const channel = await client.channels.cache.get(g.welcome.channelID);
			if (!channel) return;
			if (channel.guild.id != guild.id) return;

			// Отправка сообщения
			channel.send(replaceVars(g.welcome.welcomeText, { guild, member }));
		}

		if (g.welcome.autoRoleID != '-1') {
			const bot = guild.members.me;
			const role = guild.roles.cache.get(g.welcome.autoRoleID)
			// Проверка ролей
			if (role == undefined) return;
			if (role.rawPosition >= bot.roles.highest.rawPosition) return;
			if (bot.permissions.has('ManageRoles') == false) return;
			if (role.tags?.botId) return;
			if (role.tags?.premiumSubscriberRole) return;
			if (role.tags?.integrationId || role.managed) return;

			// Выдача роли
			member.roles.add(role, "Автороль").then(() => {
				return;
			}).catch(() => {
				return;
			});
		}
	},
};