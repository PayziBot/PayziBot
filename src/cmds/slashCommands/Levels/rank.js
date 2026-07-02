const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const create = require('../../../func/levelCard.js');
const User = require('../../../database/user.js');
const block = require('../../../games_src/profile/block.json');
const { emojis } = require('../../../config.js');
const fs = require('fs');
const { join } = require('path');
const { getLevelGuild, getLevelUserByGuild, MathNextLevel } = require('../../../database/levels.js');

module.exports = {
    category: 'levels',
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Посмотреть текущий уровень')
        .addUserOption((option) =>
            option
                .setName('пользователь')
                .setDescription('Пользователь, чей уровень надо посмотреть')
        ),
    async execute(interaction, guild) {
        await interaction.deferReply();
        let _user = interaction.options.getUser('пользователь') || interaction.user;

        let user = await User.findOne({ userID: _user.id });
        if (!user) return interaction.editReply(`${emojis.error} | К сожалению, пользователь \`${_user.username}\` не использовал бота!`);

        const g = await getLevelGuild(interaction.guild.id);
        if (!g.enabled) return interaction.editReply(`${emojis.error} | На сервере отключена система уровней. Для включения используйте команду \`/levels toggle\``);

        const us = await getLevelUserByGuild(interaction.guild.id, _user.id);

        let prosh = MathNextLevel(us.level - 1, g.xp.koeff);
        if (prosh < 0) prosh = 0;
        const progress = (us.xp - prosh) / (MathNextLevel(us.level, g.xp.koeff) - prosh);
        const nextLevel = MathNextLevel(us.level, g.xp.koeff);

        const users = [...g.data].sort((a, b) => b.level - a.level || b.xp - a.xp);
        const userPosition = users.findIndex(u => u.user === interaction.user.id) + 1;

        const avatar = _user.displayAvatarURL({ extension: 'jpg' });
        const canvas = await create(_user.username, us.level, progress, avatar, userPosition, us.xp, nextLevel);
        const img = await canvas.encode('png');
        await interaction.editReply({
            content: `Уровень: **${us.level}**\nДо следующего уровня: **${us.xp}**/**${nextLevel}** XP`,
            files: [{attachment: img, name:"rank.png"}]
        });
    },
};
