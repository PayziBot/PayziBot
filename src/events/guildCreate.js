const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { channels, colors } = require("../config.js");

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    const embed = new EmbedBuilder()
      .setTitle("Новый сервер")
      .setDescription(
        `Название: **${guild.name}**\nУчастников: **${
          guild.memberCount
        }**\nВладелец: **${
          guild.members.cache.get(guild.ownerId).user.username
        }** (${guild.ownerId})\n\nСервер создан: <t:${(
          guild.createdTimestamp / 1000
        ).toFixed(0)}:D> (<t:${(guild.createdTimestamp / 1000).toFixed(0)}:R>)`
      )
      .setColor(colors.success)
      .setFooter({
        text: `ID: ${guild.id}`,
      });
    client.channels.cache.get(channels.serverLogs).send({ embeds: [embed] });

    if (guild.members.me.permissions.has("SendMessages")) {
      const channel = await guild.channels.cache.find(
        (channel) =>
          channel.isTextBased() &&
          channel
            .permissionsFor(guild.members.me)
            .has(["SendMessages", "ViewChannel", "EmbedLinks"])
      );
      if (!channel) return;

      const message = {
        "flags": 32768,
        "components": [
          {
            "type": 17,
            "components": [
              {
                "type": 12,
                "items": [
                  {
                    "media": {
                      "url": "https://u.fifty.su/img/payzibot/welcome"
                    }
                  }
                ]
              },
              {
                "type": 10,
                "content": "# Основной функционал бота:\n- **Мини-игры**: виселица, найди пару, \"угадайте\", сапер, змейка и множество других игр\n- **Система розыгрышей**\n- **Система уровней**\n- Автореакты, автопубликация объявлений, **роли за реакции**, приветственные и прощальные сообщения, **звездная доска**\n- **Погода**, информация о Minecraft-сервере, курс валют\n\n## Все возможности по команде `/help`"
              },
              {
                "type": 1,
                "components": [
                  {
                    "type": 2,
                    "style": 5,
                    "label": "Сервер поддержки",
                    "url": "https://discord.gg/E7SFuVEB2Z"
                  },
                  {
                    "type": 2,
                    "style": 5,
                    "label": "Панель управления (скоро)",
                    "url": "https://discord.com",
                    "disabled": true
                  }
                ]
              },
              {
                "type": 10,
                "content": "-# Сообщение отправлено, поскольку бот был добавлен на сервер"
              }
            ]
          }
        ]
      };

      await channel.send(message);
    }
  },
};
