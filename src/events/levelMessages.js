const { Events } = require('discord.js');
const { getLevelGuild, getLevelUserByGuild, MathNextLevel, putLevelUser, getRolesByLevelRange } = require('../database/levels.js');
const { randomInt } = require('crypto');
const { GiveAchievement } = require('../func/games/giveAch.js');
const Guild = require('../database/guild.js');

function giveRole(message, role, level) {
	if (role == undefined) return;
	if (message.guild.members.cache.get(message.author.id).roles.cache.has(role.id)) return;
	const bot = message.guild.members.me;
	if (role.rawPosition >= bot.roles.highest.rawPosition) return;
	if (bot.permissions.has('ManageRoles') == false) return;
	if (role.tags?.botId) return;
	if (role.tags?.premiumSubscriberRole) return;
	if (role.tags?.integrationId || role.managed) return;
	message.guild.members.cache.get(message.author.id).roles.add(role, `Роль за ${level} уровень`).then(() => {
		return;
	}).catch(() => {
		return;
	});
}
module.exports = {
	name: Events.MessageCreate,
	async execute(message, client) {
		if (message.author.bot) return; // Ботов не обслуживаем

		const g = await Guild.findOne({ guildID: message.guild.id });

		const guild = await getLevelGuild(message.guild.id);
		if (!guild.enabled) return; // Дальше только сервера с включенной лвл-системой
		const user = await getLevelUserByGuild(message.guild.id, message.author.id);
		if (message.createdTimestamp - user.lastMessage < guild.interval * 1000) return; // Проверяем, прошло ли нужное количество времени между сообщениями
		const xpToAdd = guild.xp.min == guild.xp.max ? guild.xp.min : randomInt(guild.xp.min, guild.xp.max); // Получаем количество xp, необходимые для выдачи

		const oldLevel = user.level

		while (MathNextLevel(user.level, guild.xp.koeff) <= user.xp + xpToAdd) {
			user.level++;
		}

		if(user.level > oldLevel) {
			if (user.level >= 100) GiveAchievement(12, message.author.id, message.channel, g)
			if (guild.messageEnabled) {
				if (guild.channelID === '-1') {
					message.channel.send(guild.message.replace('{user.mention}', message.author)
						.replace('{user.name}', message.author.username)
						.replace('{user.id}', message.author.id)
						.replace('{guild.name}', message.guild.name)
						.replace('{level}', user.level)
						.replace('{xp}', user.xp)
					)
				}else {
					const channel = message.guild.channels.cache.get(guild.channelID);
					if (!channel) return;
					if (!channel.permissionsFor(message.guild.members.me).has(['SendMessages', 'ViewChannel'])) return;
					channel.send(guild.message.replace('{user.mention}', message.author)
						.replace('{user.name}', message.author.username)
						.replace('{user.id}', message.author.id)
						.replace('{guild.name}', message.guild.name)
						.replace('{level}', user.level)
						.replace('{xp}', user.xp)
					)
				}
			}

			if (guild.roles.length > 0) {
				const roleIds = await getRolesByLevelRange(message.guild.id, oldLevel, user.level);
				for (const roleId of roleIds) {
					const role = message.guild.roles.cache.get(roleId);
					giveRole(message, role, user.level);
				}
			}
		}
		user.xp += xpToAdd;
		user.lastMessage = message.createdTimestamp;
		putLevelUser(message.guild.id, user)

	}
};