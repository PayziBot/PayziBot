const { Schema, model, Mixed } = require('mongoose');

const giveaway = Schema({
	meta: {
		messageId: String,
		channelId: String,
		guildId: String,
	},
	startAt: Number,
	endAt: Number,
	ended: Boolean,
	winnerCount: Number,
	prize: String,
	reaction: String,
	hostedBy: String,
	winners: { type: [String], default: undefined },
	requirements: {
		minLevel: { type: Number, default: -1 }
	},
	participants: { type: [String], default: undefined },
});

module.exports = model('Giveaway', giveaway);