/* Settings -> /rolereact
Настройка системы ролей за реакции
Задержка: 7 секунд

> delete - Удалить роли за реакции с сообщения
> set - Установить роли за реакции
*/

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const { emojis } = require("../../../config.js");

module.exports = {
  category: 'settings',
  cooldown: 7,
  data: new SlashCommandBuilder()
    .setName("rolereact")
    .setDescription("Настройки ролей за реакции")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('overview')
        .setDescription('Просмотр настроек ролей за реакции'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Удалить роли за реакции с сообщения")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID сообщения, с которого надо удалить РзР")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Установить роли за реакции")
        .addRoleOption((option) =>
          option
            .setName("роль")
            .setDescription("Роль, которую требуется выдавать")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("реакция")
            .setDescription("Реакция за которую выдается роль")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID сообщения, на которого надо установить реакцию")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("канал")
            .addChannelTypes(ChannelType.GuildText)
            .setDescription("Канал, в котором расположено сообщение")
            .setRequired(true)
        )
    ),
  async execute(interaction, guild) {
    await interaction.deferReply();
    // Подкоманда: Просмотр настроек РзР
    if (interaction.options.getSubcommand() === 'overview') {
      if (guild.rr.size < 1) return interaction.followUp(`${emojis.error} | На этом сервере не установлены роли за реакции!`);

      const text = [...guild.rr.entries()]
        .map(([messageId, reactions]) => {
          return reactions.map(r => {
            return r.channelID ? `https://discord.com/channels/${interaction.guild.id}/${r.channelID}/${messageId}: <@&${r.role}> за ${r.emoji}`
              : `\`${messageId}\`: <@&${r.role}> за ${r.emoji}`;
          }).join('\n');
        })
        .join('\n');

      interaction.followUp({
        content: `${emojis.success} | На этом сервере установлены роли за реакции на следующих сообщениях:\n\n${text}\n\nФормат вывода:\n\`ID сообщения или ссылка\`: <роль> за <реакция>`,
        allowedMentions: {
          parse: []
        }
      });
      // Подкоманда: Удаление РзР
    } else if (interaction.options.getSubcommand() === "delete") {
      id = interaction.options.getString("id");

      if (guild.rr.size < 1)
        return interaction.followUp(
          `${emojis.error} | На сервере не установлены роли за реакции!`
        );
      rr = guild.rr.get(id);
      if (!rr)
        return interaction.followUp(
          `${emojis.error} | На этом сообщении не установлены роли за реакции!`
        );

      guild.rr.delete(id);
      guild.save();
      interaction.followUp(
        `${emojis.success} Роли за реакции успешно удалены с этого сообщения!`
      );
      // Подкоманда: Установка РзР
    } else if (interaction.options.getSubcommand() === "set") {
      role = interaction.options.getRole("роль");
      react = interaction.options.getString("реакция");
      id = interaction.options.getString("id");
      channel = interaction.options.getChannel("канал");

      if (!id || id.trim() === '' || !/^\d{17,20}$/.test(id)) {
        return interaction.followUp(`${emojis.error} | Некорректный id сообщения`);
      }

      // Проверяем роль и права
      const bot = interaction.guild.members.me;
      if (role == undefined) return interaction.followUp("Роли не существует?");
      if (role.rawPosition >= bot.roles.highest.rawPosition) return interaction.followUp("Я не смогу выдать эту роль, поскольку она выше моей роли");
      if (bot.permissions.has("ManageRoles") == false) return interaction.followUp("У меня нет прав на управление ролями для выдачи ролей");
      if (role.tags?.botId) return interaction.followUp("Это роль бота");
      if (role.tags?.premiumSubscriberRole) return interaction.followUp("Это роль бустера, ее нельзя выдать");
      if (role.tags?.integrationId || role.managed) return interaction.followUp("Данная роль управляется интеграцией");
      if (role.id == interaction.guild.id) return interaction.reply(`${emojis.error} | Вы не можете установить роль everyone!`);

      if (/\p{Emoji}/u.test(react) == false)
        return interaction.followUp(
          `${emojis.error} | Я думаю \`${react}\` не является эмодзи...`
        );
      if (react.includes("<")) {
        let reaction = react.split(":");
        reaction[2] = reaction[2].slice(0, -1);
        let emoji = await interaction.guild.emojis.cache.find(
          (emoji) => emoji.name === react[1]
        );
        if (!emoji || emoji.id != reaction[2])
          return interaction.followUp(
            `${emojis.error}| Кажется вы используете эмодзи, которых нет на этом сервере...`
          );
      }
      if (!channel.permissionsFor(interaction.guild.members.me).has(['AddReactions', 'ViewChannel'])) return interaction.followUp(`${emojis.error} | Для добавления реакций мне необходимо иметь права \`Добавлять реакции\` и \`Просматривать канал\` в выбранном канале!`)
      await channel.messages
        .fetch(id)
        .then((message) => {
          message.react(react);
        })
        .catch(() => {
          return interaction.followUp(
            `${emojis.error}| Данного сообщения не существует в данном канале`
          );
        });

      let arr = await guild.rr.get(id);
      if (arr?.length > 0) {
        arr.push({
          role: role.id,
          emoji: react,
          channelID: channel.id
        });
        guild.rr.delete(id);
        guild.rr.set(id, arr);
        guild.save();
        return interaction.followUp(`${emojis.success} Успешно!`);
      } else {
        arr = [];
        arr.push({
          role: role.id,
          emoji: react,
          channelID: channel.id
        });
        guild.rr.set(id, arr);
        guild.save();
        return interaction.followUp(`${emojis.success} Успешно!`);
      }
    }
  },
};
