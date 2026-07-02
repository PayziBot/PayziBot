const { SlashCommandBuilder } = require('discord.js');
const { MatchPairs } = require('../../../func/discord-gamecord');
const { GiveAchievement } = require('../../../func/games/giveAch.js');

module.exports = {
	category: 'games',
	cooldown: 15,
	data: new SlashCommandBuilder()
		.setName('memory')
		.setDescription('Найдите пары'),
	async execute(interaction, guild, user) {
		await interaction.deferReply();

		const Game = new MatchPairs({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: 'Найдите пару',
				color: guild.colors.basic,
				description: 'Кликайте на кнопки и находите одинаковые пары эмодзи!',
			},
			timeoutTime: 60000,
			emojis: ['❄️', '🎁', '🔗', '🔋', '🔥', '🍏', '💳', '💎', '🍓', '🎨', '🍍', '⛄', '🎩', '⭐', '🚀', '💚'],
			winMessage: 'Вы нашли все пары за {time}!',
			loseMessage: 'К сожалению, время вышло. Вы не смогли найти все пары.',
			playerOnlyMessage: 'Это игра пользователя {player}.',
		});

		Game.startGame();

		Game.on('gameOver', result => {
			if(result.time < 2) {
				GiveAchievement(17, interaction.user.id, interaction.channel, guild, user)
			}
		  });
	},
};
