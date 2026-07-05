const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getLevelGuild, removeLevelUserByGuild } = require('../database/levels.js');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    const { user, guild } = member;
    const g = await getLevelGuild(guild.id);

    if(!g || g.clearLevels != 'leaved') return;

    removeLevelUserByGuild(guild.id, user.id);
  },
};
