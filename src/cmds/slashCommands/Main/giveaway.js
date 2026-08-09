const { SlashCommandBuilder, ChannelType } = require('discord.js');
const ms = require('../../../func/ms.js');
const { startGiveaway, endGiveaway, rerollGiveaway, buildListMessage, PAGE_SIZE } = require('../../../func/giveaways/manager.js');
const Giveaway = require('../../../database/giveaway.js');
const { GiveAchievement } = require('../../../func/games/giveAch.js');
const { emojis } = require('../../../config.js');
const { getLevelGuild } = require('../../../database/levels.js');

function parseDuration(str) {
	const parts = str.trim().split(/\s+/);
	let total = 0;
	for (const part of parts) {
		const val = ms(part);
		if (!val || isNaN(val)) return NaN;
		total += val;
	}
	return total;
}

module.exports = {
	category: 'main',
	data: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('Управление розыгрышами')
		.addSubcommand(sub =>
			sub.setName('start').setDescription('Начать розыгрыш')
				.addStringOption(o => o.setName('время').setDescription('Время (с, м, ч, д)').setRequired(true))
				.addStringOption(o => o.setName('приз').setDescription('Приз').setRequired(true))
				.addIntegerOption(o => o.setName('победители').setDescription('Количество победителей (1-50)').setMinValue(1).setMaxValue(50).setRequired(true))
				.addChannelOption(o => o.setName('канал').setDescription('Канал для розыгрыша').addChannelTypes(ChannelType.GuildText))
				.addIntegerOption(o => o.setName('мин_уровень').setDescription('Минимальный уровень для участия').setMinValue(1))
				.addStringOption(o => o.setName('реакция').setDescription('Эмодзи на кнопке "Участвовать" (по умолчанию 🎉)')),
		)
		.addSubcommand(sub =>
			sub.setName('end').setDescription('Завершить розыгрыш досрочно')
				.addStringOption(o => o.setName('айди').setDescription('ID сообщения розыгрыша').setRequired(true)),
		)
		.addSubcommand(sub =>
			sub.setName('reroll').setDescription('Выбрать новых победителей')
				.addStringOption(o => o.setName('айди').setDescription('ID сообщения розыгрыша').setRequired(true)),
		)
		.addSubcommand(sub =>
			sub.setName('list').setDescription('Список розыгрышей на сервере'),
		),

	async execute(interaction, guild) {
		const sub = interaction.options.getSubcommand();

		if (sub === 'start') {
			const channel = interaction.options.getChannel('канал') || interaction.channel;
			const durationStr = interaction.options.getString('время');
			const winnerCount = interaction.options.getInteger('победители');
			const prize = interaction.options.getString('приз');
			const minLevel = interaction.options.getInteger('мин_уровень') || 0;
			const reaction = interaction.options.getString('реакция') || '🎉';

			const isUnicodeEmoji = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u.test(reaction);
			const isDiscordEmoji = /^<a?:\w+:\d+>$/.test(reaction);
			if (!isUnicodeEmoji && !isDiscordEmoji) {
				return interaction.reply(`${emojis.error} | \`${reaction}\` не является эмодзи.`);
			}

			const duration = parseDuration(durationStr);
			if (isNaN(duration) || duration < 20000) {
				return interaction.reply(`${emojis.error} | Укажите корректное время. Примеры: \`1д\`, \`2ч 30м\`, \`1д 12ч\`\n\nМинимальное время: 20 секунд`);
			}

			if (!channel.permissionsFor(interaction.user).has('SendMessages')) {
				return interaction.reply(`${emojis.error} | Для создания розыгрыша вам нужно право \`Отправлять сообщения\` в выбранном канале!`);
			}
			if (!channel.permissionsFor(interaction.guild.members.me).has(['SendMessages', 'ViewChannel'])) {
				return interaction.reply(`${emojis.error} | Мне нужны права \`Отправлять сообщения\` и \`Просматривать канал\` в выбранном канале!`);
			}

			if (minLevel > 0) {
				const levelGuild = await getLevelGuild(interaction.guild.id);
				if (!levelGuild?.enabled) {
					return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Включите её через \`/levels toggle\``);
				}
			}

			await interaction.reply(`${emojis.loading} | Создание розыгрыша...`);

			const doc = await startGiveaway(channel, {
				duration,
				winnerCount,
				prize,
				hostedBy: interaction.user.id,
				minLevel,
				reaction,
			});

			await interaction.editReply(`${emojis.gift} | Розыгрыш начался в ${channel}. ID: \`${doc.meta.messageId}\`\n-# Сохраните ID для досрочного завершения или выбора нового победителя`);
			GiveAchievement(8, interaction.user.id, interaction.channel, guild);
			return;
		}

		if (sub === 'end') {
			const messageId = interaction.options.getString('айди');
			const doc = await Giveaway.findOne({ 'meta.messageId': messageId, 'meta.guildId': interaction.guild.id });
			if (!doc) return interaction.reply(`${emojis.error} | Розыгрыш не найден!`);
			if (doc.ended) return interaction.reply(`${emojis.error} | Розыгрыш уже завершён!`);
			if (doc.hostedBy !== interaction.user.id) return interaction.reply(`${emojis.error} | Только организатор может завершить розыгрыш!`);

			await interaction.reply(`${emojis.loading} | Завершение розыгрыша...`);
			await endGiveaway(doc._id, interaction.client);
			return interaction.editReply(`${emojis.success} | Розыгрыш завершён!`);
		}

		if (sub === 'reroll') {
			const messageId = interaction.options.getString('айди');
			const doc = await Giveaway.findOne({ 'meta.messageId': messageId, 'meta.guildId': interaction.guild.id });
			if (!doc) return interaction.reply(`${emojis.error} | Розыгрыш не найден!`);
			if (!doc.ended) return interaction.reply(`${emojis.error} | Розыгрыш ещё не завершён!`);
			if (doc.hostedBy !== interaction.user.id) return interaction.reply(`${emojis.error} | Только организатор может выбрать новых победителей!`);

			await interaction.reply(`${emojis.loading} | Выбор новых победителей...`);
			await rerollGiveaway(doc._id, interaction.client);
			return interaction.editReply(`${emojis.success} | Новые победители выбраны!`);
		}
		if (sub === 'list') {
			const all = await Giveaway.find({ 'meta.guildId': interaction.guild.id }).sort({ startAt: -1 });
			if (!all.length) return interaction.reply({ content: `${emojis.error} | На этом сервере нет розыгрышей!`, ephemeral: true });

			const totalPages = Math.ceil(all.length / PAGE_SIZE);
			const slice = all.slice(0, PAGE_SIZE);
			return interaction.reply(buildListMessage(slice, 1, totalPages, interaction.guild.id));
		}
	},
};
