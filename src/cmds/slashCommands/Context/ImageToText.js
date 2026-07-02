const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { createWorker } = require('tesseract.js');
const { GiveAchievement } = require('../../../func/games/giveAch.js');
const { emojis } = require('../../../config.js');
const Guild = require('../../../database/guild.js');

module.exports = {
	category: '',
	data: new ContextMenuCommandBuilder()
		.setName('Фото в текст')
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const guild = await Guild.findOne({ guildID: interaction.guildId });
		
		const message = await interaction.options.getMessage('message');
		if (!message.attachments.size) return interaction.editReply(`${emojis.error} | В данном сообщении нет картинки`);
		const attachment = message.attachments.first();
		if (!attachment.contentType.startsWith('image/')) return interaction.editReply(`${emojis.error} | В данном сообщении нет картинки`);

		const worker = await createWorker('rus+eng');
		const ret = await worker.recognize(attachment.url);
		if (!ret.data.text) return interaction.editReply(`${emojis.error} | Текст на картинке отсутствует`);
		if (ret.data.text.length > 2000) return interaction.editReply(`${emojis.error} | На картинке более 2 тысяч символов`);
		interaction.editReply(ret.data.text);
		GiveAchievement(3, interaction.user.id, interaction.channel, guild);
		await worker.terminate();
	},
};
