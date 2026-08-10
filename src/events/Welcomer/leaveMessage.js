const { Events } = require('discord.js');
const Guild = require('../../database/guild.js');
const { replaceVars } = require('../../func/system/variables.js');

module.exports = {
	name: Events.GuildMemberRemove,
	async execute(member, client) {
		// Поиск сервера в базе данных
		const guild = member.guild;
		const g = await Guild.findOne({ guildID: guild.id });
		if (!g) return;
		if (g.leave.channelID == '-1') return;

		// Получение канала
		const channel = await client.channels.cache.get(g.leave.channelID);
		if(!channel) return;
		if (channel.guild.id != guild.id) return;

		// Отправка сообщения
		channel.send(replaceVars(g.leave.leaveText, { guild, member }));
	},
};