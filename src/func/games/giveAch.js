const User = require('../../database/user.js');
const ach_list = require('../../games_src/profile/achievements.json');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function CheckAch(ach, id, channel, g, u) {
	const user = u ? u : await User.findOne({ userID: id });
	if (!user) return;
	if(user.ach.includes(ach)) return;
	user.ach.push(ach);
	user.save();
	SendMess(ach, id, channel, g);
}

async function SendMess(ach, id, channel, g) {
	const ach_link = new ButtonBuilder()
	.setLabel('Все достижения')
	.setURL('https://docs.payzibot.ru/first-steps/achievements')
	.setStyle(ButtonStyle.Link);

	const row = new ActionRowBuilder()
			.addComponents(ach_link);

	const embed = new EmbedBuilder()
  .setTitle("Новое достижение!")
  .setDescription(`Получено достижение: **${ach_list[ach].translatable.ru.title}** (${ach_list[ach].translatable.ru.description})`)
  .setColor(g.colors.achievement)
  .setFooter({
    text: "Все достижения по кнопке ниже ⬇️",
  });

await channel.send({ content: `<@${id}>`, embeds: [embed], components: [row] });
	}

module.exports = {
	CheckAch,
	SendMess
};