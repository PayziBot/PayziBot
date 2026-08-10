const { Events } = require('discord.js');
const Giveaway = require('../../database/giveaway.js');
const { buildActiveMessage, buildControlMessage, buildListMessage, PAGE_SIZE, endGiveaway, rerollGiveaway } = require('../../func/giveaways/manager.js');
const { getLevelUserByGuild } = require('../../database/levels.js');
const { emojis } = require('../../config.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction, client) {
		if (!interaction.isButton()) return;
		const { customId } = interaction;

		if (customId.startsWith('giveaway_entry_')) {
			const id = customId.slice('giveaway_entry_'.length);
			const doc = await Giveaway.findById(id).catch(() => null);
			if (!doc || doc.ended) return interaction.reply({ content: `${emojis.error} | Розыгрыш завершён или не найден.`, ephemeral: true });

			if (doc.requirements?.minLevel > 0) {
				const levelUser = await getLevelUserByGuild(interaction.guild.id, interaction.user.id);
				if (!levelUser || levelUser.level < doc.requirements.minLevel) {
					return interaction.reply({ content: `${emojis.error} | Для участия требуется **${doc.requirements.minLevel}** уровень!`, ephemeral: true });
				}
			}

			const participants = doc.participants ?? [];
			const idx = participants.indexOf(interaction.user.id);
			let replyText;

			if (idx === -1) {
				participants.push(interaction.user.id);
				replyText = `${emojis.success} | Вы участвуете в розыгрыше!`;
			} else {
				participants.splice(idx, 1);
				replyText = `${emojis.error} | Вы вышли из розыгрыша.`;
			}

			doc.participants = participants;
			await doc.save();

			await interaction.message.edit(buildActiveMessage(doc)).catch(() => {});
			return interaction.reply({ content: replyText, ephemeral: true });
		}

		if (customId.startsWith('giveaway_control_')) {
			const id = customId.slice('giveaway_control_'.length);
			const doc = await Giveaway.findById(id).catch(() => null);
			if (!doc) return interaction.reply({ content: `${emojis.error} | Розыгрыш не найден.`, ephemeral: true });
			if (doc.hostedBy !== interaction.user.id) return interaction.reply({ content: `${emojis.error} | Только организатор розыгрыша может управлять им.`, ephemeral: true });

			return interaction.reply(buildControlMessage(doc));
		}

		if (customId.startsWith('giveaway_end_')) {
			const id = customId.slice('giveaway_end_'.length);
			const doc = await Giveaway.findById(id).catch(() => null);
			if (!doc) return interaction.reply({ content: `${emojis.error} | Розыгрыш не найден.`, ephemeral: true });
			if (doc.hostedBy !== interaction.user.id) return interaction.reply({ content: `${emojis.error} | Только организатор может завершить розыгрыш.`, ephemeral: true });
			if (doc.ended) return interaction.reply({ content: `${emojis.error} | Розыгрыш уже завершён.`, ephemeral: true });

			await interaction.deferUpdate();
			await endGiveaway(id, client);
			return;
		}

		if (customId.startsWith('giveaway_reroll_')) {
			const id = customId.slice('giveaway_reroll_'.length);
			const doc = await Giveaway.findById(id).catch(() => null);
			if (!doc) return interaction.reply({ content: `${emojis.error} | Розыгрыш не найден.`, ephemeral: true });
			if (doc.hostedBy !== interaction.user.id) return interaction.reply({ content: `${emojis.error} | Только организатор может выбрать новых победителей.`, ephemeral: true });
			if (!doc.ended) return interaction.reply({ content: `${emojis.error} | Розыгрыш ещё не завершён.`, ephemeral: true });

			await interaction.deferUpdate();
			await rerollGiveaway(id, client);
			return;
		}

		if (customId.startsWith('galist_prev_') || customId.startsWith('galist_next_')) {
			const parts = customId.split('_');
			const dir = parts[1];
			const currentPage = parseInt(parts[2]);
			const guildId = parts.slice(3).join('_');

			const newPage = dir === 'prev' ? currentPage - 1 : currentPage + 1;

			const all = await Giveaway.find({ 'meta.guildId': guildId }).sort({ startAt: -1 });
			const totalPages = Math.ceil(all.length / PAGE_SIZE);
			const slice = all.slice((newPage - 1) * PAGE_SIZE, newPage * PAGE_SIZE);

			return interaction.update(buildListMessage(slice, newPage, totalPages, guildId));
		}
	},
};
