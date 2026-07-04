const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { emojis } = require("../../../config.js");
const { getPlayer, getServer } = require("../../../func/apis/minecraft.js");

module.exports = {
  category: "utility",
  cooldown: 1,
  data: new SlashCommandBuilder()
    .setName("minecraft")
    .setDescription("Информация об игроке или сервере")
    .addSubcommand(subcommand =>
      subcommand
        .setName('server')
        .setDescription('Информация о Minecraft-сервере')
        .addStringOption((option) =>
          option
            .setName("адрес")
            .setDescription("Адрес сервера")
            .setRequired(true)
        ))
    .addSubcommand(subcommand =>
      subcommand
        .setName('player')
        .setDescription('Информация о лицензии Minecraft-игрока')
        .addStringOption((option) =>
          option
            .setName("ник")
            .setDescription("Никнейм игрока или его UUID")
            .setRequired(true)
        )),
  async execute(interaction, guild) {
    await interaction.deferReply();
    if (interaction.options.getSubcommand() === 'server') {
      const ip = interaction.options.getString("адрес");
      const r = await getServer(ip);
      if (r === 'error') return interaction.editReply(`${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`);
      if (r?.ip_address == "127.0.0.1" || !r?.online) return interaction.editReply(`${emojis.error} | Сервер выключен!`);
      const playerList = r?.players?.list ? r.players.list.slice(0, 15).map(player => player.name_clean).join("\n") : "";

      const message = {
        "flags": 32768,
        "components": [
          {
            "type": 17,
            "components": [
              {
                "type": 10,
                "content": `# ${r.host}\n\n${r.motd.clean}`
              },
              {
                "type": 14,
                "spacing": 2,
                "divider": true
              },
              {
                "type": 9,
                "components": [
                  {
                    "type": 10,
                    "content": `IP: **${r.ip_address}**\nВерсия: **${r.version.name_clean}**\nИгроков: **${r.players.online}/${r.players.max}**`
                  }
                ],
                "accessory": {
                  "type": 11,
                  "media": {
                    "url": `https://api.mcstatus.io/v2/icon/${r.host}`
                  }
                }
              }
            ]
          }
        ]
      };

      if (playerList) message.components[0].components.push({
        "type": 10,
        "content": `### Игроки\n${playerList}`
      })

      interaction.editReply(message);

    } else if (interaction.options.getSubcommand() === 'player') {
      const name = interaction.options.getString("ник");
      await getPlayer(name).then((r) => {
        if (r === 'error') return interaction.editReply(`${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`);
        if (r?.code === "minecraft.invalid_username") return interaction.editReply(`${emojis.error} | Игрок не найден`);
        if (r?.code != "player.found") return interaction.editReply(`${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`);
        const embed = new EmbedBuilder()
          .setTitle(r?.data?.player?.username || "Неизвестный игрок")
          .setDescription(`UUID: \`${r?.data?.player?.id}\``)
          .setThumbnail(`https://nmsr.nickac.dev/bust/${r?.data?.player?.id}`)
          .setColor(guild.colors.basic)

        const skin = new ButtonBuilder()
          .setLabel("Скачать скин")
          .setURL(r?.data?.player?.skin_texture)
          .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder().addComponents(skin);
        interaction.editReply({ embeds: [embed], components: [row] });
      });
    }
  },
};
