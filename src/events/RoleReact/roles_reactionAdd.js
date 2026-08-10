const { Events } = require('discord.js');
const Guild = require('../../database/guild.js');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(react, user) {
		if (react.message.partial) await react.message.fetch();
		if (react.partial) await react.fetch();

		// Поиск сервера в базе данных
		const guild = await Guild.findOne({ guildID: react.message.guild.id });
		if (!guild) return;

		// Отстраняем сервера, где нет ролей за реакцию
		if(guild.rr.size < 1) return;

		// Поиск объекта по айди сообщения
		const rr = guild.rr.get(react.message.id);
		if(!rr) return;

		// Сверяем реакцию и находим нужную роль
		let _role;
		for(let i = 0; i < rr.length; i++) {
			if (react.emoji.name != rr[i].emoji) continue;
			_role = rr[i].role; break;
		}
		if (_role == undefined) return;
		const bot = react.message.guild.members.me;
		const member = react.message.guild.members.cache.get(user.id);
		const role = react.message.guild.roles.cache.get(_role);

		// Проверяем роль и права
		if (role == undefined) return;
		if (role.rawPosition >= bot.roles.highest.rawPosition) return;
		if (bot.permissions.has('ManageRoles') == false) return;
		if (role.tags?.botId) return;
		if (role.tags?.premiumSubscriberRole) return;
		if (role.tags?.integrationId || role.managed) return;

		// Выдача роли
		member.roles.add(role, `Роль за реакцию: ${react.message.id}`).then(() => {
			return;
		}).catch(() => {
			return;
		});
	},
};

// Структура const rr
// [{
// 	role: "role id",
// 	emoji: "emoji"
// }]