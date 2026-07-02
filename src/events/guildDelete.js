const { Events, EmbedBuilder } = require('discord.js');
const { channels, colors } = require('../config.js');

module.exports = {
	name: Events.GuildDelete,
	async execute(guild, client) {
		const embed = new EmbedBuilder()
			.setTitle('Сервер удалён')
			.setDescription(`Название: **${guild.name}**\nУчастников: **${guild.memberCount}**\n\nСервер создан: <t:${(guild.createdTimestamp / 1000).toFixed(0)}:D> (<t:${(guild.createdTimestamp / 1000).toFixed(0)}:R>)`)
			.setColor(colors.error)
			.setFooter({
				text: `ID: ${guild.id}`,
			});

		client.channels.cache.get(channels.serverLogs)
			.send({ embeds: [embed] });
	},
};