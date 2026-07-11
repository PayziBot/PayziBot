/* Settings -> /levels
Настройка системы уровней
Задержка: 7 секунд

> toggle - Включить/Выключить систему уровней
> channel-set - Установить канал для оповещений о новом уровне
> message - Установить сообщение о новом уровне
> reset - Обнулить уровни всех пользователей
> set-level - Установить уровень определенному пользователю
> set-xp-range - Установить диапазон XP за сообщение
> add-role-level - Создать новую роль за уровень
*/

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { emojis } = require('../../../config.js');
const { setLevelGuildXp, setLevelGuildEnabled, resetLevelUser, getLevelGuild, setLevelGuildChannel, getLevelUserByGuild, putLevelUser, MathNextLevel, addRoleLevel, setLevelGuildInterval, setClearLevelsStatus } = require('../../../database/levels.js');

module.exports = {
  category: 'settings',
  cooldown: 7,
  data: new SlashCommandBuilder()
    .setName('levels')
    .setDescription('Настройки системы уровней')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('overview')
        .setDescription('Просмотр настроек системы уровней'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('toggle')
        .setDescription('Включить/Выключить систему уровней'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('channel-set')
        .setDescription('Установить канал для оповещений о новом уровне')
        .addChannelOption((option) =>
          option
            .setName('канал')
            .addChannelTypes(ChannelType.GuildText)
            .setDescription('Канал, в который будут отправляться сообщения')
            .setRequired(false)
        ))
    .addSubcommand(subcommand =>
      subcommand
        .setName('message')
        .setDescription('Установить сообщение о новом уровне'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Обнулить уровни всех пользователей'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('set-level')
        .setDescription('Установить уровень определенному пользователю')
        .addUserOption((option) =>
          option
            .setName('пользователь')
            .setDescription('Пользователь, которому вы хотите установить уровень')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('уровень')
            .setDescription('Уровень, который вы хотите установить')
            .setMinValue(1)
            .setMaxValue(1000)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('set-interval')
        .setDescription('Установить интервал между начислением опыта')
        .addIntegerOption((option) =>
          option
            .setName('интервал')
            .setDescription('Интервал между начислением опыта (в секундах)')
            .setMinValue(1)
            .setMaxValue(3600)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('add-role-level')
        .setDescription('Создать новую роль за уровень')
        .addRoleOption((option) =>
          option
            .setName('роль')
            .setDescription('Роль, которая должна выдаваться пользователю по достижении уровня')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('уровень')
            .setDescription('Уровень, за который выдаётся роль')
            .setMinValue(1)
            .setMaxValue(1000)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('set-xp-range')
        .setDescription('Установить диапазон XP за сообщение')
        .addIntegerOption((option) =>
          option
            .setName('мин')
            .setDescription('Минимальное количество XP за сообщение')
            .setMinValue(1)
            .setMaxValue(1000))
        .addIntegerOption((option) =>
          option
            .setName('макс')
            .setDescription('Максимальное количество XP за сообщение')
            .setMinValue(1)
            .setMaxValue(1000))
        .addIntegerOption((option) =>
          option
            .setName('фикс')
            .setDescription('Фиксированное количество XP за сообщение')
            .setMinValue(1)
            .setMaxValue(1000)))
      .addSubcommand(subcommand => 
        subcommand
          .setName('clear-levels')
          .setDescription('Установить, очищается ли уровень при выходе с сервера/блокировке')
          .addIntegerOption(option =>
            option.setName('очищать')
              .setDescription('За что очищать уровень?')
              .setRequired(true)
              .addChoices(
                { name: 'не очищать.', value: 'none' },
                { name: 'за выход с сервера', value: 'leaved' },
                { name: 'при блокировке пользователя', value: 'banned' },
              ))),
  async execute(interaction, guild) {
    const g = await getLevelGuild(interaction.guild.id);

    // overview - Просмотр настроек системы уровней
    if (interaction.options.getSubcommand() === 'overview') {
      
      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);
      interaction.reply(`${emojis.success} | Система уровней **включена**!\n\nИнтервал между начислением опыта: **${g.interval}** секунд\nДиапазон XP за сообщение: от **${g.xp.min}** до **${g.xp.max}** XP\nКанал для оповещений о новом уровне: ${g.channelID != "-1" ? `<#${g.channelID}>` : "**в канал сообщения**"}\nСообщение о новом уровне: \`\`\`${g.message}\`\`\`\nРоли за уровни:\n${g.roles.length > 0 ? g.roles.map(r => `<@&${r.roleId}> (**${r.level}** уровень)`).join(',\n') : "нет ролей"}`)

    // toggle - Включить/Выключить систему уровней
  } else if (interaction.options.getSubcommand() === 'toggle') {

      await setLevelGuildEnabled(interaction.guild.id, !g.enabled)
      interaction.reply(`${emojis.success} Система уровней теперь **${!g.enabled ? 'включена' : 'выключена'}**!`)

      // reset - Обнулить уровни всех пользователей
    } else if (interaction.options.getSubcommand() === 'reset') {

			if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      const confirmButton = new ButtonBuilder()
        .setCustomId('confirmReset')
        .setLabel('Подтвердить')
        .setStyle(ButtonStyle.Danger);

      const actionRow = new ActionRowBuilder().addComponents(confirmButton);

      await interaction.reply({
        content: `${emojis.timeout} Вы уверены, что хотите обнулить уровни всех пользователей? Нажмите "Подтвердить" для подтверждения.`,
        components: [actionRow],
        ephemeral: true
      });

      const filter = i => i.customId === 'confirmReset' && i.user.id === interaction.user.id;

      try {
        const confirmation = await interaction.channel.awaitMessageComponent({ filter, time: 15000 });

        await resetLevelUser(interaction.guild.id)
        await confirmation.update({ content: `${emojis.success} Уровни всех пользователей успешно обнулены!`, components: [] });
        await interaction.channel.send(`${emojis.success} ${interaction.user.toString()} успешно обнулил уровни всех пользователей!`)
      } catch {
        await interaction.editReply({ content: `${emojis.error} Время ожидания истекло, операция отменена.`, components: [] });
      }

      // channel-set - Установить канал для оповещений о новом уровне
    } else if (interaction.options.getSubcommand() === 'channel-set') {

      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      channel = interaction.options.getChannel('канал')

      if(!channel) {
        await setLevelGuildChannel(interaction.guild.id, "-1")
        return interaction.reply(`${emojis.success} Оповещения о новом уровне теперь будут приходить в канал, в котором пользователь написал сообщение!`)
      }
      await setLevelGuildChannel(interaction.guild.id, channel.id)
      if (!channel.permissionsFor(interaction.guild.members.me).has(['SendMessages', 'ViewChannel'])) return interaction.reply(`${emojis.error} | Для отправки сообщений о новых уровнях мне необходимо иметь права \`Отправлять сообщения\` и \`Просматривать канал\` в выбранном канале!`)
      interaction.reply(`${emojis.success} Оповещения о новом уровне будут приходить в канал <#${channel.id}>`)

      // message - Установить сообщение о новом уровне
    } else if (interaction.options.getSubcommand() === 'message') {

      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      const modal = new ModalBuilder()
        .setCustomId('level')
        .setTitle('Настройка сообщений о новом уровне');

      const text = new TextInputBuilder()
        .setCustomId('text')
        .setLabel("Введите текст, который будет выводиться")
        .setMaxLength(1024)
        .setStyle(TextInputStyle.Paragraph);

      const textRow = new ActionRowBuilder().addComponents(text);

      modal.addComponents(textRow);

      await interaction.showModal(modal);

      // set-level - Установить уровень определенному пользователю
    } else if (interaction.options.getSubcommand() === 'set-level') {

      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      const level = interaction.options.getInteger('уровень');
      const _user = interaction.options.getUser('пользователь');

      const user = await getLevelUserByGuild(interaction.guild.id, _user.id);
      const xps = MathNextLevel(level - 1, g.xp.koeff)

      user.xp = parseInt(xps)
      user.level = level

      await putLevelUser(interaction.guild.id, user)

      interaction.reply(`${emojis.success} Пользователю <@${_user.id}> успешно установлен **${level}** уровень (${xps} XP)`)

      // set-interval - Установить интервал между начислением опыта
    } else if (interaction.options.getSubcommand() === 'set-interval') {

      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      const interval = interaction.options.getInteger('интервал');

      await setLevelGuildInterval(interaction.guild.id, interval);

      interaction.reply(`${emojis.success} Интервал между начислением опыта установлен на **${interval}** секунд!`)

      // add-role-level - Создать новую роль за уровень
    } else if (interaction.options.getSubcommand() === 'add-role-level') {

      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      const role = interaction.options.getRole('роль');
      const level = interaction.options.getInteger('уровень');

      bot = interaction.guild.members.me;

      if (role.rawPosition >= bot.roles.highest.rawPosition) return interaction.reply(`${emojis.error} | Увы, я не смогу выдать роль, которая выше моей`)
      if (bot.permissions.has('ManageRoles') == false) return interaction.reply(`${emojis.error} | Для создания роли за уровень мне необходимо иметь право \`Управлять ролями\`!`);
      if (role.tags?.botId) return interaction.reply(`${emojis.error} | Роль принадлежит боту <@${role.tags.botId}>`);
      if (role.tags?.premiumSubscriberRole) return interaction.reply(`${emojis.error} | Я не смогу выдать роль бустера!`);
      if (role.tags?.integrationId || role.managed) return interaction.reply(`${emojis.error} | Роль управляется интеграцией`);
      if (role.id == interaction.guild.id) return interaction.reply(`${emojis.error} | Вы не можете установить роль everyone!`);

      await addRoleLevel(interaction.guild.id, role.id, level)

      interaction.reply(`${emojis.success} С этого момента роль будет выдаваться всем пользователям, достигшим **${level}** уровня!`)

      // set-xp-range - Установить диапазон XP для уровней
    } else if (interaction.options.getSubcommand() === 'set-xp-range') {

      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      const min = interaction.options.getInteger('мин');
      const max = interaction.options.getInteger('макс');
      const fix = interaction.options.getInteger('фикс');

      if(fix && min || fix && max) return interaction.reply(`${emojis.error} | Вы не можете использовать фиксированное количество XP вместе с диапазоном! Пожалуйста, выберите что-то одно!\тНапример, для установки 3 XP за уровень просто введите \`/levels set-xp-range фикс: 3\``);

      if(fix) {
        await setLevelGuildXp(interaction.guild.id, fix, fix);
        return interaction.reply(`${emojis.success} С этого момента за каждое сообщение пользователи будут получать **${fix}** XP!`)
      }

      if(!min || !max) return interaction.reply(`${emojis.error} | Пожалуйста, укажите и минимальное, и максимальное количество XP!`);
      if(min > max) return interaction.reply(`${emojis.error} | Минимальное количество XP не может быть больше максимального!`);
      if(max < min) return interaction.reply(`${emojis.error} | Максимальное количество XP не может быть меньше минимального!`);

      await setLevelGuildXp(interaction.guild.id, min, max);

      interaction.reply(`${emojis.success} С этого момента за каждое сообщение пользователи будут получать от **${min}** до **${max}** XP!`)

      // clear-levels
    } else if (interaction.options.getSubcommand() === 'clear-levels') {

      if(!g.enabled) return interaction.reply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

      const isClear = interaction.options.getInteger('очищать');

      await setClearLevelsStatus(interaction.guild.id, isClear);

      if(isClear === 'banned') {
        interaction.reply(`${emojis.success} С этого момента у пользователей будет очищаться уровень, если его заблокируют`);
      } else if(isClear === 'leaved') {
        interaction.reply(`${emojis.success} С этого момента у пользователей будет очищаться уровень, если он выйдет с сервера или его заблокируют`);
      } else {
        interaction.reply(`${emojis.success} С этого момента у пользователей НЕ будет очищаться уровень, если он выйдет с сервера или его заблокируют`);
      }
    }
  },
};