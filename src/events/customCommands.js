const { Events } = require('discord.js');
const Guild = require('../database/guild.js');
const { GiveAchievement } = require('../func/games/giveAch.js');
const { replaceVars } = require('../func/system/variables.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message, client) {
		if(message.guild.id != '1106931587267969036') return;
		const guild = await Guild.findOne({ guildID: message.guild.id });
		if (!guild) return;
		if (guild.customCommands.size < 1) return;
		if (guild.customCommands.has(message.content) == false) return;
		const command = await guild.customCommands.get(message.content);
		// Можно добавлять очень много критерий для выполнения, например:
		// if(command.allowUsers && command.allowUsers.length > 0) {
		//   if(command.allowUsers[0] != 'everyone' && command.allowUsers.includes(message.author.id) == false) return;
		// }
		// В данном примере команда приватна и может выполниться только определёнными пользователями
		if (command.allowUsers && command.allowUsers.length > 0) {
			if (command.allowUsers[0] != 'everyone' && command.allowUsers.includes(message.author.id) == false) return;
		}
		if (command.allowChannels && command.allowChannels.length > 0) {
			if (command.allowChannels[0] != 'all' && command.allowChannels.includes(message.channel.id) == false) return;
		}
		if (!command.reply) return;
		const answer = replaceVars(command.reply, { guild: message.guild, message });
		message.reply(answer);
		GiveAchievement(5, message.author.id, message.channel, guild)
		client.dailyStat.cmdsUsed++;
	},
};