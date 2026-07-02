const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const os = require('os');
const { version } = require('../../../../package.json');
const { emojis } = require('../../../config.js');
const plural = require('../../../func/plural.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Информация о боте'),
	async execute(interaction, guild) {
		await interaction.deferReply();
		const client = interaction.client;
		const embed = new EmbedBuilder()
			.setTitle(`PayziBot ${version}`)
			.setDescription(`${emojis.arrow} Бот запущен <t:${(new Date()/1000).toFixed(0) - (client.uptime/1000).toFixed(0)}:R>\n${emojis.arrow} За день ${plural(client.dailyStat.cmdsUsed, "использована", "использовано", "использовано")} **${client.dailyStat.cmdsUsed} ${plural(client.dailyStat.cmdsUsed, "команда", "команды", "команд")}**`)
			.addFields(
				{
					name: 'Статистика',
					value: `Серверов: **${client.guilds.cache.size}**\nКаналов: **${client.channels.cache.size}**\nПользователей: **${client.users.cache.size}**`,
				},
				{
					name: 'Система',
					value: `CPU: \`${os.cpus()[0].model}\`\nRAM: \`${(process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(0)} МБ\`/\`${(os.totalmem() / (1024 * 1024)).toFixed(0)} МБ\`\nWebSocket: \`${client.ws.ping}ms\``,
				},
			)
			.setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.client.user.id}/${interaction.client.user.avatar}.webp?size=4096`)
			.setColor(guild.colors.basic);
		const link_button = new ButtonBuilder()
			.setLabel("Сервер поддержки")
			.setURL("https://discord.gg/E7SFuVEB2Z")
			.setStyle(ButtonStyle.Link);
		const link_button2 = new ButtonBuilder()
			.setLabel("Добавить бота")
			.setURL("https://discord.com/api/oauth2/authorize?client_id=576442351426207744&permissions=1411299798102&scope=bot")
			.setStyle(ButtonStyle.Link);
		const link_button3 = new ButtonBuilder()
			.setLabel("Сайт")
			.setURL("https://payzibot.ru/")
			.setStyle(ButtonStyle.Link);
		const link_button4 = new ButtonBuilder()
			.setLabel("Исходный код")
			.setURL("https://github.com/Payziii/PayziBot/")
			.setStyle(ButtonStyle.Link);
		
		const row = new ActionRowBuilder()
			.addComponents(link_button, link_button2, link_button3, link_button4);

		await interaction.editReply({ embeds: [embed], components: [row] });
	},
};
