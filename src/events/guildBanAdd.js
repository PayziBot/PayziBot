const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getLevelGuild, removeLevelUserByGuild } = require('../database/levels.js');

module.exports = {
  name: Events.GuildBanAdd,
  async execute(ban, client) {
    const { user, guild } = ban;
    const g = await getLevelGuild(guild.id);

    if(!g || g.clearLevels != 'banned') return;

    removeLevelUserByGuild(guild.id, user.id);
  },
};
