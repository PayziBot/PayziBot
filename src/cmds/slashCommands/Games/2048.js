const { SlashCommandBuilder } = require('discord.js');
const { TwoZeroFourEight } = require('../../../func/discord-gamecord');
const { GiveAchievement } = require('../../../func/games/giveAch.js');

module.exports = {
	category: 'games',
	cooldown: 15,
	data: new SlashCommandBuilder()
		.setName('2048')
		.setDescription('Игра 2048'),
	async execute(interaction, guild, user) {
		await interaction.deferReply();

		const Game = new TwoZeroFourEight({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: '2048',
				color: guild.colors.basic,
			},
			emojis: {
				up: '⬆️',
				down: '⬇️',
				left: '⬅️',
				right: '➡️',
			  },
			  timeoutTime: 60000,
			  buttonStyle: 'PRIMARY',
			  playerOnlyMessage: 'Эта игра предназначена для {player}'
		});

		Game.startGame();

		Game.on('gameOver', result => {
			if(result.score >= 2048) {
				GiveAchievement(11, interaction.user.id, interaction.channel, guild, user)
			}
		  });
	},
};
