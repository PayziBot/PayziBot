const { SlashCommandBuilder } = require('discord.js');
const { Minesweeper } = require('../../../func/discord-gamecord');
const { GiveAchievement } = require('../../../func/games/giveAch.js');

module.exports = {
	category: 'games',
	cooldown: 15,
	data: new SlashCommandBuilder()
		.setName('minesweeper')
		.setDescription('Игра в сапёра')
		.addIntegerOption((option) =>
			option
				.setName('количество')
				.setDescription('Количество мин на карте (1-23)')
				.setMinValue(1)
				.setMaxValue(23)),
	async execute(interaction, guild, user) {
		await interaction.deferReply();
		let count = interaction.options.getInteger('количество');
		if (count == null) count = 5;

		const Game = new Minesweeper({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: 'Сапёр',
				color: guild.colors.basic,
				description: 'Нажимайте на кнопки ниже, чтобы открывать поле',
			},
			emojis: { flag: '🚩', mine: '💣' },
			mines: count,
			timeoutTime: 60000,
			winMessage: 'Вы выиграли! Вы успешно нашли все мины',
			loseMessage: 'Вы подорвались!',
			playerOnlyMessage: 'Эта игра предназначена для {player}',
		});

		Game.startGame();

		Game.on('gameOver', result => {
			if(result.result == 'win') {
				GiveAchievement(0, interaction.user.id, interaction.channel, guild, user)
			}
		  });
	},
};
