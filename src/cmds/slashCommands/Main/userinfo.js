const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { emojis } = require('../../../config.js');
const flags = {
	'': 'None',
	'ActiveDeveloper': '<:ActiveDeveloper:1106487595803877376>',
	'BugHunterLevel1': '<:BugHunter1:1106488199397789707>',
	'BugHunterLevel2': '<:BugHunter2:1106488253047115806>',
	'CertifiedModerator': '<:CertifiedModerator:1106488362333917215> ',
	'HypeSquadOnlineHouse1': '<:HypeSquadBravery:1106488701325955072>',
	'HypeSquadOnlineHouse2': '<:HypeSquadBrilliance:1106527440379068436>',
	'HypeSquadOnlineHouse3': '<:HypeSquadBalance:1106488947372200056>',
	'Hypesquad': '<:HypeSquadEvents:1106489062698795010>',
	'Partner': '<:DiscordPartner:1106489199546339409>',
	'PremiumEarlySupporter': '<:EarlySupporter:1106489367645659146>',
	'Staff': '<:DiscordStaff:1106489645237285015>',
	'VerifiedBot': '<:Bot:732119152755474444>',
	'VerifiedDeveloper': '<:Developer:1106490170917781616>',
};
const statuses = {
	offline: '<:offline:674463290755252277>',
	online: '<:online:674463345625268225>',
	dnd: '<:dnd:674463406983610410>',
	idle: '<:idle:674463345927258152>',
};

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Получить информацию о пользователе')
		.addUserOption((option) =>
			option
				.setName('пользователь')
				.setDescription('Пользователь, чья информация вас интересует')
				.setRequired(false),
		),
	async execute(interaction, guild) {
		const user = interaction.options.getUser('пользователь') || interaction.user;
		const bannerUrl = await interaction.client.users.fetch(user.id, { force: true }).then((user) => {
			return user.bannerURL({ size: 256, dynamic: true });
		})
		const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=128`;
		const member = await interaction.guild.members.cache.get(user.id);
		if (!member) return interaction.reply(`${emojis.error} | Пользователь не найден на сервере!`);
		let activity;
		const presenceActivity = member.presence?.activities?.[0];

		if (!presenceActivity) {
			activity = '';
		} else if (presenceActivity.name === 'Custom Status') {
			activity = presenceActivity.state ?? '';
		} else {
			const parts = [];
			if (presenceActivity.name) parts.push(`**${presenceActivity.name}**`);
			if (presenceActivity.details) parts.push(presenceActivity.details);
			if (presenceActivity.state) parts.push(presenceActivity.state);
			activity = parts.join('\n');
		}

		const message = {
			"flags": 32768,
			"components": [
				{
					"type": 17,
					"components": [
						{
							"type": 9,
							"components": [
								{
									"type": 10,
									"content": `${statuses[member.presence?.status ?? 'offline']} **${member.displayName}** ${user.flags.toArray().map(flag => flags[flag]).filter(Boolean).join(' ')}`
								},
							],
							"accessory": {
								"type": 11,
								"media": {
									"url": avatarUrl
								}
							}
						},
						{
							"type": 10,
							"content": `**Дата регистрации**\n<t:${(user.createdTimestamp / 1000).toFixed(0)}:D> (<t:${(user.createdTimestamp / 1000).toFixed(0)}:R>)\n\n**Вошёл на сервер**\n<t:${(member.joinedTimestamp / 1000).toFixed(0)}:D> (<t:${(member.joinedTimestamp / 1000).toFixed(0)}:R>)`
						},
						{
							"type": 14,
							"spacing": 1,
							"divider": true
						},
						{
							"type": 10,
							"content": `**Роли:**\n${member.roles.cache.filter(r => r.id !== r.guild.id).map(r => r).join(', ') || 'Отсутствуют'}`
						},
						{
							"type": 10,
							"content": `-# ID: ${user.id}`
						}
					]
				}
			]
		};

		if (activity) message.components[0].components[0].components.push({
			"type": 10,
			"content": activity
		})

		if (bannerUrl) message.components[0].components.splice(message.components[0].components.length - 1, 0, {
			"type": 12,
			"items": [
				{
					"media": {
						"url": `${bannerUrl}`
					}
				}
			]
		})
		await interaction.reply(message);
	},
};
