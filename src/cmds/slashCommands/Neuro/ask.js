const { SlashCommandBuilder } = require("discord.js");
const { GiveAchievement } = require('../../../func/games/giveAch.js');
const { emojis } = require('../../../config.js');

const { RsnChat } = require('rsnchat');
const rsnchat = new RsnChat(process.env.RSN_API_KEY);

module.exports = {
  category: 'neuro',
  cooldown: 10,
  skip: true,
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Задать вопрос нейросети')
    .addStringOption((option) =>
      option.setName('запрос')
        .setDescription('Что вы хотите спросить?')
        .setMaxLength(1024)
        .setRequired(true))
    .addStringOption((option) =>
      option.setName('модель')
        .setDescription('Модель, которой вы задаёте вопрос')
        .setRequired(true)
        .addChoices(
          { name: 'Gemini', value: 'gemini' },
          { name: 'GPT 4', value: 'gpt' },
          { name: 'Grok-2-mini', value: 'grok-2-mini' },
          { name: 'Grok-2', value: 'grok-2' }
        )
    ),
  async execute(interaction, guild) {
    await interaction.deferReply();

    GiveAchievement(14, interaction.user.id, interaction.channel, guild)

    const model = interaction.options.getString('модель');
    const text = interaction.options.getString('запрос');

    let res;

    let _tip = '';
    let tip = Math.random();
    if(tip < 0.1) _tip = '\nНапоминаем, что вы можете использовать команду `,ask (ваш запрос)` для быстрого получения ответа.\nПодробнее: https://docs.payzibot.ru/commands/neuro#ask'
    interaction.editReply(`${emojis.loading} | Ожидаем ответа...${_tip}`)

    if (model === 'gpt') {
      await rsnchat.chat(text, "gpt4")
        .then(response => {
          res = response.message
        }).catch(() => {
          interaction.editReply(`${emojis.error} | Что-то произошло. Повторите свой запрос чуть позже, либо измените его!`)
          return
        });
    } else if (model === 'gemini') {
      await rsnchat.chat(text, "gemini")
        .then(response => {
          res = response.message
        }).catch(() => {
          interaction.editReply(`${emojis.error} | Что-то произошло. Повторите свой запрос чуть позже, либо измените его!`)
          return 
        });
    } else if (model === 'grok-2') {
      await rsnchat.chat(text, "grok-2")
        .then(response => {
          res = response.message
        }).catch(() => {
          interaction.editReply(`${emojis.error} | Что-то произошло. Повторите свой запрос чуть позже, либо измените его!`)
          return 
        });
    } else {
      await rsnchat.chat(text, "grok-2-mini")
        .then(response => {
          res = response.message
        }).catch(() => {
          interaction.editReply(`${emojis.error} | Что-то произошло. Повторите свой запрос чуть позже, либо измените его!`)
          return 
        });
    }

    if (!res) return interaction.editReply(`${emojis.error} | Ответ не был получен!`);
			if (res.length > 2000) {
				let mess = res;
				mess = mess.substring(0, 1930);
				mess = mess + '...\n\n-# Ответ был обрезан из-за ограничений Discord!';
				return interaction.editReply(mess);
			}
			interaction.editReply(res);
  },
};
