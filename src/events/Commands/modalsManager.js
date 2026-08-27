const { Events, Collection } = require('discord.js');
const Guild = require('../../database/guild.js');
const { setLevelGuildMessage } = require('../../database/levels.js');
const { emojis } = require('../../config.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction, client) {

		if (!interaction.isModalSubmit()) return;

		// Получаем сервер из базы данных
		let guild = await Guild.findOne({ guildID: interaction.guild.id });
		if (!guild) return;

		if (interaction.customId === 'welcome') {
			const text = interaction.fields.getTextInputValue('text');
			guild.welcome.welcomeText = text;
			guild.save();
			interaction.reply(`${emojis.success} Приветственное сообщение успешно установлено!`)
		}else if (interaction.customId === 'leave') {
			const text = interaction.fields.getTextInputValue('text');
			guild.leave.leaveText = text;
			guild.save();
			interaction.reply(`${emojis.success} Прощальное сообщение успешно установлено!`)
		}else if (interaction.customId === 'level') {
			const text = interaction.fields.getTextInputValue('text');
			await setLevelGuildMessage(interaction.guild.id, true, text)
			interaction.reply(`${emojis.success} Сообщение о новом уровне успешно установлено!`)
		}
	},
};