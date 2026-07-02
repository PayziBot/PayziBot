const { Events } = require('discord.js');
const Guild = require('../database/guild.js');
const User = require('../database/user.js');
const { emojis } = require('../config.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message, client) {

	if (message.author.bot) return;

	const msg = message.content;

	const args = msg.trim().split(/ +/g); // Аргументы
	const command = args.shift().toLowerCase();
	const cmd =
		client.textCommands.get(command) ||
		client.textCommands.find(
			cm => cm.help.aliases && cm.help.aliases.includes(command),
		);

	if (!cmd) return;

	// Получаем пользователя и сервер из базы данных
	let guild = await Guild.findOne({ guildID: message.guild.id });
	let user = await User.findOne({ userID: message.author.id });

	if (!guild) return message.reply(`${emojis.error} | Для начала используйте любую слэш-команду, например \`/help\``);
	if (!user) return message.reply(`${emojis.error} | Для начала используйте любую слэш-команду, например \`/help\``);

	// При уровне блокировки 2 и выше ограничиваем доступ
	if(user.block >= 2) return;

	client.dailyStat.cmdsUsed++;
	client.dailyStat.cmdsDetailed.set(command, (client.dailyStat.cmdsDetailed.get(command) || 0) + 1);
	
	// Выполнение команды
	cmd.run(client, message, args, guild, user);
	
	},
};