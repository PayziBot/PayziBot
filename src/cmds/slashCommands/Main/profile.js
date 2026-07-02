const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const User = require('../../../database/user.js');
const block = require('../../../games_src/profile/block.json');
const ach = require('../../../games_src/profile/achievements.json');
const { emojis } = require('../../../config.js');
const { getLevelGuild, getLevelUserByGuild, MathNextLevel } = require('../../../database/levels.js');

module.exports = {
	category: 'games',
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Профиль PayziBot')
		.addUserOption((option) =>
			option
				.setName('пользователь')
				.setDescription('Пользователь, чей профиль вы смотрите')
		),
	async execute(interaction, guild) {
		await interaction.deferReply();
		let _user = interaction.options.getUser('пользователь') || interaction.user;

		let user = await User.findOne({ userID: _user.id });
		if (!user) return interaction.editReply(`${emojis.error} | К сожалению, пользователь \`${_user.username}\` не использовал бота!`);
		let block_message = `\n${block[user.block].emoji} Блокировка: **${block[user.block].name}**\n`;
		if(user.block < 1) block_message = '';
		let lvlMess;
		const g = await getLevelGuild(interaction.guild.id);
		if(!g.enabled) lvlMess = 'На сервере отключена система уровней';
		else {
			const us = await getLevelUserByGuild(interaction.guild.id, _user.id);
			lvlMess = `Уровень: **${us.level}**\nXP: **${us.xp}**/**${MathNextLevel(us.level, g.xp.koeff)}**`
		}
		const embed = new EmbedBuilder()
			.setTitle(`${_user.username}`)
			.setColor(guild.colors.basic)
			.setDescription(`${user.bio}\n${block_message}`)
			.setThumbnail(`https://cdn.discordapp.com/avatars/${_user.id}/${_user.avatar}.webp?size=4096`)
			.addFields(
				{
					name: "Уровень",
					value: `${lvlMess}`,
					inline: false
				  },
				{
				  name: "Достижения",
				  value: `Всего достижений: **${user.ach.length}**`,
				  inline: false
				},
				{
				  name: "Игры",
				  value: `Побед в "угадайте...": **${user.games.game + user.games.city + user.games.logo + user.games.flag + user.games.country}**`,
				  inline: false
				},
			  )
			  .setFooter({ text: `ID: ${_user.id}` });

			  const ach_button = new ButtonBuilder()
			.setCustomId('ach_button')
			.setLabel('Достижения')
			.setStyle(ButtonStyle.Secondary);
		const games_button = new ButtonBuilder()
			.setCustomId('games_button')
			.setLabel('Игры')
			.setStyle(ButtonStyle.Secondary);
		const row = new ActionRowBuilder()
			.addComponents(ach_button, games_button);

			let text = user.ach.map(id => {
				const achievement = ach.find(x => x.id === id);
				return achievement ? `${achievement.badge} | ${achievement.translatable.ru.title}` : '';
			}).join("\n");
			const ach_embed = new EmbedBuilder()
			.setTitle(`Достижения ${_user.username}`)
			.setThumbnail(`https://cdn.discordapp.com/avatars/${_user.id}/${_user.avatar}.webp?size=4096`)
			.setDescription(text || "Отсутствуют")
			.setColor(guild.colors.basic);

			const game_embed = new EmbedBuilder()
			.setTitle(`Игры ${_user.username}`)
			.setThumbnail(`https://cdn.discordapp.com/avatars/${_user.id}/${_user.avatar}.webp?size=4096`)
			.setDescription(`Угадано городов: **${user.games.city}**\nУгадано  игр: **${user.games.game}**\nУгадано логотипов: **${user.games.logo}**\nУгадано флагов: **${user.games.flag}**\nУгадано стран: **${user.games.country}**`)
			.setColor(guild.colors.basic);

			const response = await interaction.editReply({ embeds: [embed], components: [row] });

			const collectorFilter = i => i.user.id === interaction.user.id;

			try {

			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation.customId === 'ach_button') {
				await interaction.editReply({ embeds: [ach_embed], components: [] });
			}
			else if (confirmation.customId === 'games_button') {
				await interaction.editReply({ embeds: [game_embed], components: [] });
			}
		}
		catch (e) {
			if (e.message.includes('messageDelete')) return;
			await interaction.editReply({ embeds: [embed], components: [] });
		}
	},
};
