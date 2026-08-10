/* Settings -> /autoreact
Настройка системы автореакта
Задержка: 7 секунд

> off - Выключить автореакт
> set - Установить автореакт
*/

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { emojis } = require('../../../config.js');

module.exports = {
  category: 'settings',
  cooldown: 7,
  data: new SlashCommandBuilder()
    .setName('autoreact')
    .setDescription('Настройки автореактинга')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('overview')
        .setDescription('Просмотр настроек автореактинга'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('off')
        .setDescription('Выключить автореактинг'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Установить автореактинг')
        .addChannelOption((option) =>
          option
            .setName('канал')
            .addChannelTypes(ChannelType.GuildText)
            .setDescription('Канал, в котором будет работать автореактинг')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('реакции')
            .setDescription('Реакции (через пробел), которые будут ставиться на сообщения')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('порядок')
            .setDescription('Порядок простановки автореактинга')
            .addChoices(
              { name: 'Линейный', value: 'lineal' },
              { name: 'Случайный', value: 'random' }
            )
        )
    ),
  async execute(interaction, guild) {
    await interaction.deferReply();
    if (interaction.options.getSubcommand() === 'overview') {
      if (guild.autoreact.channelID == '-1' && guild.autoreact.reacts.length == 0) return interaction.followUp(`${emojis.error} | Автореактинг выключен!`);
      interaction.followUp(`${emojis.success} | Автореактинг **включён** в канале <#${guild.autoreact.channelID}> в ${guild.autoreact.mode === 'lineal' ? 'линейном' : 'случайном'} порядке с реакциями: ${guild.autoreact.reacts.join(', ')}`)
    } else if (interaction.options.getSubcommand() === 'off') {
      if (guild.autoreact.channelID == '-1' && guild.autoreact.reacts.length == 0) return interaction.followUp(`${emojis.error} | Я думаю, автореактинг и так выключен...`)
      guild.autoreact.channelID = '-1';
      guild.autoreact.reacts = [];
      guild.save()
      interaction.followUp(`${emojis.success} Автореактинг успешно выключен!`)
    } else if (interaction.options.getSubcommand() === 'set') {
      channel = interaction.options.getChannel('канал')
      text = interaction.options.getString('реакции')
      mode = interaction.options.getString('порядок') || 'lineal';
      reacts = text.split(' ');

      if (reacts.length > 20) return interaction.followUp(`${emojis.error} | Я не смогу поставить больше 20 реакций на сообщение!`);

      if (!channel.permissionsFor(interaction.guild.members.me).has(['AddReactions', 'ViewChannel'])) return interaction.followUp(`${emojis.error} | Для установки реакций мне необходимо иметь права \`Добавлять реакции\` и \`Просматривать канал\` в выбранном канале!`)

      for (reaction of reacts) {
        const isUnicodeEmoji = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u.test(reaction);
        const isDiscordEmoji = /^<a?:\w+:\d+>$/.test(reaction);

        if (!isUnicodeEmoji && !isDiscordEmoji) {
          return interaction.followUp(`${emojis.error} | Я думаю \`${reaction}\` не является эмодзи...`)
        }
        if (reaction.includes('<')) {
          reaction = reaction.split(':')
          reaction[2] = reaction[2].slice(0, -1)
          let emoji = await interaction.guild.emojis.cache.find(emoji => emoji.name === reaction[1]);
          if (!emoji || emoji.id != reaction[2]) return interaction.followUp(`${emojis.error} | Кажется вы используете эмодзи, которых нет на этом сервере...`)
        }
      }
      guild.autoreact.channelID = channel.id;
      guild.autoreact.reacts = reacts;
      guild.autoreact.mode = mode;
      guild.save()
      interaction.followUp(`${emojis.success} Автореактинг успешно включён в канале <#${channel.id}> в ${mode === 'lineal' ? 'линейном' : 'случайном'} порядке с реакциями: ${reacts.join(', ')}`)
      const index = interaction.client.autoreactChannels.indexOf(channel.id);
      if (index !== -1) {
        interaction.client.autoreactChannels.splice(index, 1);
      }
    }
  },
};