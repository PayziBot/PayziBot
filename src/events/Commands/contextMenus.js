const { Events } = require('discord.js');
const { emojis } = require('../../config.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isContextMenuCommand()) return;
		if (interaction.channel === null) return interaction.reply(`${emojis.error} | Я доступен только на серверах!`);
		const cmd = interaction.client.commands.get(interaction.commandName);
		if (!cmd) return interaction.reply(`${emojis.error} | Команда не найдена. Как такое могло произойти?`);
		try {
			await cmd.execute(interaction);
		}
		catch (error) {
			if (interaction.deferred === false) {
				interaction.reply(`${emojis.error} | Произошла ошибка!\n\`\`\`bash\n${error}\`\`\``);
			}
			else {
				interaction.editReply(`${emojis.error} | Произошла ошибка!\n\`\`\`bash\n${error}\`\`\``);
			}
			console.log(error);
		}
	},
};