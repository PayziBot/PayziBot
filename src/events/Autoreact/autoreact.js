const { Events } = require('discord.js');
const Guild = require('../../database/guild.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message, client) {
		try {
			// Проверяем на наличие канала в массиве каналов с отключенным автореактом
			if(client.autoreactChannels.includes(message.channel.id)) return;

			// Поиск сервера в базе данных
			const guild = await Guild.findOne({ guildID: message.guild.id });

			// Добавляем канал в массив каналов с отключенным автореактом
			if (!guild) return client.autoreactChannels.push(message.channel.id);
			if (guild.autoreact.channelID == '-1') return client.autoreactChannels.push(message.channel.id);
			if(message.channel.id != guild.autoreact.channelID) return client.autoreactChannels.push(message.channel.id);

			// Получение канала
			const channel = await client.channels.cache.get(guild.autoreact.channelID);
			if (!channel) return;

			// Проверка прав
			if (!channel.permissionsFor(message.guild.members.me).has(['AddReactions', 'ViewChannel'])) return;

			// Получение порядка простановки и реакций
			const mode = guild.autoreact.mode || 'lineal';
			const reacts = await guild.autoreact.reacts; 

			// Простановка реакций
			if (mode === 'random') {
				const randomReacts = [...reacts].sort(() => Math.random() - 0.5);
				for (const reaction of randomReacts) {
					message.react(parseReaction(reaction));
				}
			} else {
				for (const reaction of reacts) {
					await message.react(parseReaction(reaction));
				}
			}
		}
		catch (error) {
			console.log(error);
		}

	},
};

const parseReaction = (reaction) => {
    const match = reaction.match(/^<a?:(\w+):(\d+)>$/);
    if (match) return `${match[1]}:${match[2]}`; 
    return reaction; 
};