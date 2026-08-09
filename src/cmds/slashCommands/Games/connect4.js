const { SlashCommandBuilder } = require('discord.js');
const { Connect4 } = require('../../../func/discord-gamecord');
const { emojis } = require('../../../config.js');

module.exports = {
	category: 'games',
	cooldown: 15,
	data: new SlashCommandBuilder()
		.setName('connect4')
		.setDescription('Четыре в ряд')
		.addUserOption((option) =>
			option
				.setName('пользователь')
				.setDescription('Пользователь, с которым хотите поиграть.')
				.setRequired(true)),
	async execute(interaction, guild) {
		await interaction.deferReply();
		const user = interaction.options.getUser('пользователь');

		if (interaction.user.id == user.id) return interaction.editReply(`${emojis.error} | Вы не можете играть сами с собой!`);
		if (user.bot) return interaction.editReply(`${emojis.error} | Вы не можете играть с ботами!`);

		const Game = new Connect4({
			message: interaction,
			isSlashGame: true,
			opponent: user,
			embed: {
				title: 'Четыре в ряд',
				statusTitle: 'Статус',
				color: guild.colors.basic,
			},
			emojis: {
				board: '⚪',
				player1: '🟢',
				player2: '🔵'
			},
			mentionUser: true,
			timeoutTime: 60000,
			buttonStyle: 'PRIMARY',
			turnMessage: '{emoji} | Ход игрока **{player}**.',
			winMessage: '{emoji} | **{player}** выиграл игру!',
			tieMessage: 'Ничья!',
			timeoutMessage: 'Время ожидания истекло. Игра завершена.',
			playerOnlyMessage: 'Только {player} и {opponent} могут использовать кнопки.',
			requestMessage: '{player} пригласил вас сыграть в **Четыре в ряд**!',
			rejectMessage: 'Пользователь отказался от игры.'
		});

		Game.startGame();
	},
};
