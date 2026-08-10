const { Events, ChannelType } = require('discord.js');
const Guild = require('../../database/guild.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message, client) {
		try {
			if(message.channel.type != ChannelType.GuildAnnouncement) return;
			if(message.author.id == client.user.id) return;

			const guild = await Guild.findOne({ guildID: message.guild.id });
			if (!guild) return;
			if (!guild.autoPublishingChannels.includes(message.channel.id)) return;

			message.crosspost();
		}
		catch (error) {
			console.log(error);
		}

	},
};