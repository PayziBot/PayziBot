const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const User = require('../../../database/user.js');
const block = require('../../../games_src/profile/block.json');
const { emojis } = require('../../../config.js');
const { getLevelGuild, getLevelUserByGuild, MathNextLevel } = require('../../../database/levels.js');

module.exports = {
	category: 'levels',
	data: new SlashCommandBuilder()
		.setName('leaders')
		.setDescription('Посмотреть список лидеров'),
	async execute(interaction, guild) {
		await interaction.deferReply();
		
		const g = await getLevelGuild(interaction.guild.id);
		if (!g.enabled) {
			return interaction.editReply(`${emojis.error} | На сервере отключена система уровней.`);
		}

		let users = [...g.data];

		users.sort((a, b) => {
			if (b.level !== a.level) return b.level - a.level;
			return b.xp - a.xp;
		});

		const top10 = users.slice(0, 10);

		let lvlMess = '## Таблица лидеров\n';
		let userPosition = null;

		for (let i = 0; i < users.length; i++) {
			if (users[i].user === interaction.user.id) {
				userPosition = i + 1;
				break;
			}
		}

		top10.forEach((user, index) => {
			lvlMess += `${index == 0 ? '🥇' : index == 1 ? '🥈' : index == 2 ? '🥉' : `${index + 1}. `} <@${user.user}> — Уровень: **${user.level}** | XP: **${user.xp}**\n`;
		});

		if (top10.length === 0) {
			lvlMess = 'Пока что нет данных для отображения лидеров!';
		}

		if (userPosition) {
			if (userPosition <= 10) {
				lvlMess += `\n-# ➡️ Вы на **${userPosition}** месте`;
			} else {
				lvlMess += `\n-# ➡️ Ваша позиция: **${userPosition}**`;
			}
		} else {
			lvlMess += `\n-# ➡️ Вы ещё не набирали опыт на этом сервере.`;
		}

		const message = {
			"flags": 32768,
			"allowed_mentions": {
				"parse": [
					"users"
				]
			},
			"components": [
				{
					"type": 17,
					"components": [
						{
							"type": 10,
							"content": lvlMess
						}
					]
				}
			]
		};

		await interaction.editReply(message);
	},
};
