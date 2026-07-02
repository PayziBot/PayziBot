const { Events, EmbedBuilder } = require('discord.js');
const Guild = require('../database/guild.js');
const { GiveAchievement } = require('../func/games/giveAch.js');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(react) {
		if (react.message.partial) await react.message.fetch();
		if (react.partial) await react.fetch();
		const guild = await Guild.findOne({ guildID: react.message.guild.id });
		if (!guild) return;
		const customReact = guild.starboard.customReact;
		const isDiscordEmoji = /^<a?:\w+:\d+>$/.test(customReact);
		let emojiMatches;
		if (isDiscordEmoji) {
			const emojiId = customReact.split(':')[2].slice(0, -1);
			emojiMatches = react.emoji.id === emojiId;
		} else {
			emojiMatches = react.emoji.name === customReact;
		}
		if (!emojiMatches) return;
		if (guild.starboard.channelID == '-1') return;
		if (react.count < guild.starboard.reqReacts) return;
		const messageAttachment = react.message.attachments.size > 0 ? Array.from(react.message.attachments.values())[0].url : null;

		const embed = new EmbedBuilder()
			.setAuthor({
				name: react.message.author.username,
				iconURL: react.message.author.displayAvatarURL(),
			})
			.setColor(guild.colors.starboard)
			.setImage(messageAttachment);
		const content = react.message.content.replaceAll(' ', '');
		if (content.length > 0) embed.setDescription(react.message.content || 'Пустое сообщение');
		const msg = guild.starboard.data.get(react.message.id);
		const reactMsg = customReact;
		const channel = react.message.guild.channels.cache.get(guild.starboard.channelID);
		if (msg == undefined) {
			if(react.message.channel.nsfw && !channel.nsfw) return;
			channel.send({ content: `${reactMsg} **${react.count}:** ${react.message.url}`, embeds: [embed] })
				.then(message => {
					guild.starboard.data.set(react.message.id, message.id);
					guild.save();
					GiveAchievement(4, react.message.author.id, react.message.channel, guild)
				})
				.catch(e => console.log(e));
		}
		else {
			channel.messages.edit(msg, { content: `${reactMsg} **${react.count}:** ${react.message.url}`, embeds: [embed] })
				.catch(e => console.log(e));
		}
	},
};