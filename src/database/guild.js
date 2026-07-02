const { Schema, model } = require('mongoose');
const { colors } = require('../config.js');

const guild = Schema({
	guildID: String,
	colors: {
		basic: { type: String, default: colors.basic },
		error: { type: String, default: colors.error },
		correct: { type: String, default: colors.success },
		starboard: { type: String, default: colors.starboard },
		giveaway: { type: String, default: colors.basic },
		achievement: { type: String, default: colors.basic },
	},
	starboard: {
		channelID: { type: String, default: '-1' },
		reqReacts: { type: Number, default: 1 },
		customReact: { type: String, default: '⭐' },
		data: { type: Map, default: [] },
	},
	neuro: {
		chatgpt: { type: Boolean, default: false },
		auto: { type: Boolean, default: false },
		channels: { type: Array, default: [] }
	},
	welcome: {
		channelID: { type: String, default: '-1' },
		welcomeText: { type: String, default: 'Привет, {user.mention}. Добро пожаловать на {guild.name}' },
		autoRoleID: { type: String, default: '-1' },
	},
	leave: {
		channelID: { type: String, default: '-1' },
		leaveText: { type: String, default: 'О нет, {user.name} покинул нас!' },
	},
	premium: {
		status: { type: Boolean, default: false },
		userID: { type: String, default: '-1' },
		endDate: { type: Number, default: 0 },
		startDate: { type: Number, default: 0 },
	},
	autoreact: {
		channelID: { type: String, default: '-1' },
		reacts: { type: Array, default: [] },
		mode: { type: String, default: 'lineal' },
	},
	rr: { type: Map, default: [] },
	customCommands: { type: Map, default: [] },
	autoPublishingChannels: { type: Array, default: [] },
});

module.exports = model('Guild', guild);