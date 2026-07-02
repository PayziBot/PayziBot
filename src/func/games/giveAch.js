const User = require('../../database/user.js');
const achievements_list = require('../../games_src/profile/achievements.json');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function GiveAchievement(achievement, user_id, channel, guild, u) {
	const user = u ? u : await User.findOne({ userID: user_id });
	if (!user) return;
	if (user.ach.includes(achievement)) return;
	user.ach.push(achievement);
	user.save();
	SendAchievementMessage(achievement, user_id, channel, guild);
}

async function SendAchievementMessage(achievement, user_id, channel, guild) {
	const ach_link = new ButtonBuilder()
		.setLabel('Все достижения')
		.setURL('https://docs.payzibot.ru/first-steps/achievements')
		.setStyle(ButtonStyle.Link);

	const row = new ActionRowBuilder()
		.addComponents(ach_link);

	const embed = new EmbedBuilder()
		.setTitle("Новое достижение!")
		.setDescription(`Получено достижение: **${achievements_list[achievement].translatable.ru.title}** (${achievements_list[achievement].translatable.ru.description})`)
		.setColor(guild.colors.achievement)
		.setFooter({
			text: "Все достижения по кнопке ниже ⬇️",
		});

	await channel.send({ content: `<@${user_id}>`, embeds: [embed], components: [row] });
}

module.exports = {
	GiveAchievement,
	SendAchievementMessage
};