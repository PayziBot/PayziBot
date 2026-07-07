const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");
const { emojis } = require("../../../config.js");
const price = require("../../../func/apis/price.js");

module.exports = {
  category: "utility",
  cooldown: 1,
  data: new SlashCommandBuilder()
    .setName("exchange")
    .setDescription("Курс валют")
    .addStringOption((option) =>
      option
        .setName("из")
        .setDescription("Валюта, курс которой Вы хотите посмотреть (пр. USD)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("в")
        .setDescription("Валюта, курс в которой вы хотите посмотреть (пр. RUB)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('количество')
        .setDescription('Количество монет')
        .setMinValue(1)
    ),
  async execute(interaction, guild) {
    const from = interaction.options.getString("из");
    const to = interaction.options.getString("в");
    const amount = interaction.options.getInteger("количество") || 1;
    await interaction.deferReply();

    await price.convert(process.env.PRICE_API_KEY, from.toUpperCase(), to, amount).then((r) => {
      interaction.editReply(`${emojis.exchange} **${r.amount}** ${r.from} = **${r.value.toFixed(2)}** ${r.to}`);
    }).catch(() => {
      interaction.editReply(`${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`);
    })
  },
};
