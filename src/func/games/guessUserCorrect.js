const User = require('../../database/user.js');
const Guild = require('../../database/guild.js');
const { GiveAchievement } = require('./giveAch.js');

async function Correct(game, id, channel) {
    const user = await User.findOne({ userID: id });
    const guild = await Guild.findOne({ guildID: channel.guild.id });
    if (!user) return;

    switch (game) {
        case 'game':
            user.games.game++;
            break;

        case 'city':
            if (user.games.city >= 49) {
                GiveAchievement(1, id, channel, guild, user);
            }
            user.games.city++;
            break;

        case 'logo':
            user.games.logo++;
            break;

        case 'flag':
            user.games.flag++;
            break;

        case 'country':
            if (user.games.country >= 110) {
                GiveAchievement(10, id, channel, guild, user);
            }
            user.games.country++;
            break;
    }

    await user.save();
}

module.exports = {
	Correct
};