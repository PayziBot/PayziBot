const Giveaway = require('../../database/giveaway.js');

function parseButtonEmoji(emojiStr) {
	const match = emojiStr?.match(/^<(a?):(\w+):(\d+)>$/);
	if (match) return { id: match[3], name: match[2], animated: match[1] === 'a' };
	return { name: emojiStr || '🎉' };
}

const FLAGS_V2 = 32768;
const FLAGS_V2_EPHEMERAL = 32768 | 64;

function buildActiveMessage(giveaway) {
	const id = giveaway._id.toString();
	const count = giveaway.participants?.length ?? 0;

	let content = `## Розыгрыш начался\n\nПриз: **${giveaway.prize}**\nПобедителей: **${giveaway.winnerCount}**\nРозыгрыш начал: <@${giveaway.hostedBy}>`;
	if (giveaway.requirements?.minLevel > 0) {
		content += `\n\n### Требования\nМин. уровень: **${giveaway.requirements.minLevel}**`;
	}
	content += `\n\n-# Окончание: <t:${Math.floor(giveaway.endAt / 1000)}:f>`;

	return {
		flags: FLAGS_V2,
		components: [{
			type: 17,
			components: [
				{ type: 10, content },
				{
					type: 1,
					components: [
						{ type: 2, style: 3, label: `Участвовать (${count})`, custom_id: `giveaway_entry_${id}`, emoji: parseButtonEmoji(giveaway.reaction) },
						{ type: 2, style: 2, label: '⁝', custom_id: `giveaway_control_${id}` },
					],
				},
			],
		}],
	};
}

function buildEndedMessage(giveaway) {
	const id = giveaway._id.toString();
	const count = giveaway.participants?.length ?? 0;
	const winnersText = giveaway.winners?.length
		? giveaway.winners.map(w => `<@${w}>`).join(', ')
		: 'Нет победителей';

	const content = `## Розыгрыш завершён\n\nПриз: **${giveaway.prize}**\nРозыгрыш начал: <@${giveaway.hostedBy}>\n\n### Победители\n${winnersText}`;

	return {
		flags: FLAGS_V2,
		components: [{
			type: 17,
			components: [
				{ type: 10, content },
				{
					type: 1,
					components: [
						{ type: 2, style: 3, label: `Участвовать (${count})`, custom_id: `giveaway_entry_${id}`, emoji: parseButtonEmoji(giveaway.reaction), disabled: true },
						{ type: 2, style: 2, label: '⁝', custom_id: `giveaway_control_${id}` },
					],
				},
			],
		}],
	};
}

function buildControlMessage(giveaway) {
	const id = giveaway._id.toString();
	const button = giveaway.ended
		? { type: 2, style: 2, label: 'Выбор новых победителей', custom_id: `giveaway_reroll_${id}` }
		: { type: 2, style: 4, label: 'Завершить', custom_id: `giveaway_end_${id}` };

	return {
		flags: FLAGS_V2_EPHEMERAL,
		components: [{
			type: 17,
			components: [
				{ type: 10, content: '## Управление розыгрышем' },
				{ type: 1, components: [button] },
			],
		}],
	};
}

function pickWinners(participants, count) {
	const shuffled = [...participants].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(count, shuffled.length));
}

async function startGiveaway(channel, options) {
	const { duration, winnerCount, prize, hostedBy, minLevel = 0, reaction = '🎉' } = options;
	const now = Date.now();

	const doc = await Giveaway.create({
		meta: { channelId: channel.id, guildId: channel.guild.id },
		startAt: now,
		endAt: now + duration,
		ended: false,
		winnerCount,
		prize,
		hostedBy,
		reaction,
		requirements: { minLevel },
		participants: [],
	});

	const message = await channel.send(buildActiveMessage(doc));
	doc.meta.messageId = message.id;
	await doc.save();

	return doc;
}

async function endGiveaway(giveawayId, client) {
	const doc = await Giveaway.findById(giveawayId);
	if (!doc || doc.ended) return null;

	const winners = pickWinners(doc.participants ?? [], doc.winnerCount);
	doc.ended = true;
	doc.winners = winners;
	await doc.save();

	try {
		const channel = await client.channels.fetch(doc.meta.channelId);
		const message = await channel.messages.fetch(doc.meta.messageId);
		await message.edit(buildEndedMessage(doc));

		const winnersText = winners.length
			? winners.map(w => `<@${w}>`).join(', ')
			: 'нет участников';
		await message.reply(`🎉 Розыгрыш **${doc.prize}** завершён! Победители: ${winnersText}`);
	} catch (e) {
		console.error(`[Giveaway] endGiveaway message update failed (${giveawayId}):`, e);
	}

	return doc;
}

async function rerollGiveaway(giveawayId, client) {
	const doc = await Giveaway.findById(giveawayId);
	if (!doc || !doc.ended) return null;

	const winners = pickWinners(doc.participants ?? [], doc.winnerCount);
	doc.winners = winners;
	await doc.save();

	try {
		const channel = await client.channels.fetch(doc.meta.channelId);
		const message = await channel.messages.fetch(doc.meta.messageId);
		await message.edit(buildEndedMessage(doc));

		const winnersText = winners.length
			? winners.map(w => `<@${w}>`).join(', ')
			: 'нет участников';
		await message.reply(`🎉 Новые победители розыгрыша **${doc.prize}**: ${winnersText}`);
	} catch (e) {
		console.error(`[Giveaway] rerollGiveaway message update failed (${giveawayId}):`, e);
	}

	return doc;
}

async function checkExpiredGiveaways(client) {
	const expired = await Giveaway.find({ ended: false, endAt: { $lte: Date.now() } });
	for (const doc of expired) {
		await endGiveaway(doc._id, client);
	}
}

module.exports = { buildActiveMessage, buildEndedMessage, buildControlMessage, startGiveaway, endGiveaway, rerollGiveaway, checkExpiredGiveaways };
