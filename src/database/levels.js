// Использование lmdb-js
// Используется для хранения уровней пользователей

const { open } = require('lmdb');

// Открываем бд для хранения уровней
let levelsDB = open({
    path: 'levels-db',
    compression: true,
});

function MathNextLevel(current, koeff) {
    return (100 * (current * 1.7 + 1) * koeff).toFixed(0);
}

/**
 * Создание нового сервера в базе данных
 * 
 * @param {string} guildID 
 */
async function createLevelGuild(guildID) {
    await levelsDB.put(guildID, {
        enabled: false,
        interval: 60,
        xp: {
            min: 1,
            max: 5,
            koeff: 0.7
        },
        channelID: "-1",
        messageEnabled: true,
        clearLevels: "none", // none, banned, leaved
        message: "🎉 Поздравляем, {user.mention}, вы достигли **{level}** уровня!",
        roles: [], // {roleId, level, cleanable}, {}
        data: [] // {user, xp, level, lastMessage}, {}
    })

    return true;
}

/**
 * Получение сервера в базе данных
 * 
 * @param {string} guildID 
 */
async function getLevelGuild(guildID) {
    let guild = levelsDB.get(guildID);
    if (guild == undefined) {
        await createLevelGuild(guildID);
        guild = levelsDB.get(guildID);
    }

    return guild;
}

/**
 * Включить или отключить лвл-систему на сервере
 * 
 * @param {string} guildID 
 * @param {boolean} status 
 */
async function setLevelGuildEnabled(guildID, status) {
    const guild = await getLevelGuild(guildID);
    guild.enabled = status;
    levelsDB.put(guildID, guild);

    return true;
}

/**
 * Установить удаление уровней для вышедших/забаненных пользователей
 * 
 * @param {string} guildID 
 * @param {boolean} status 
 */
async function setClearLevelsStatus(guildID, status) {
    const guild = await getLevelGuild(guildID);
    guild.clearLevels = status;
    levelsDB.put(guildID, guild);

    return true;
}

/**
 * Установить ID канала для оповещений о новом уровне
 * 
 * @param {string} guildID 
 * @param {string} channelID
 */
async function setLevelGuildChannel(guildID, channelID) {
    const guild = await getLevelGuild(guildID);
    guild.channelID = channelID;
    levelsDB.put(guildID, guild);

    return true;
}

/**
 * Установить сообщения оповещений о новом уровне
 * 
 * @param {string} guildID 
 * @param {string} message
 */
async function setLevelGuildMessage(guildID, message) {
    const guild = await getLevelGuild(guildID);
    guild.message = message;
    levelsDB.put(guildID, guild);

    return true;
}
/**
 * Установить интервал между начислением опыта
 * 
 * @param {string} guildID 
 * @param {number} interval
 */
async function setLevelGuildInterval(guildID, interval) {
    const guild = await getLevelGuild(guildID);
    guild.interval = interval;
    levelsDB.put(guildID, guild);

    return true;
}

/**
 * Обновить информацию о юзере
 * 
 * @param {string} guildID 
 * @param {*} user
 */
async function putLevelUser(guildID, user) {
    const guild = await getLevelGuild(guildID);
    const { data } = guild;
    let u = data.find(us => us.user === user.user);
    data[data.indexOf(u)] = user;
    if (!u) data.push(user)
    guild.data = data;
    levelsDB.put(guildID, guild);

    return true;
}

/**
 * Очистить информацию о юзерах на сервере
 * 
 * @param {string} guildID 
 */
async function resetLevelUser(guildID) {
    const guild = await getLevelGuild(guildID);
    guild.data = [];
    levelsDB.put(guildID, guild);

    return true;
}

/**
 * Получение инфорамции о пользователе на сервере
 * 
 * @param {string} guildID 
 * @param {string} userID 
 */
async function getLevelUserByGuild(guildID, userID) {
    const guild = await getLevelGuild(guildID);
    const { data } = guild;
    let user = data.find(user => user.user === userID);
    if (!user) return user = await setLevelUserByGuild(guildID, userID);

    return user;
}

/**
 * Получение ID роли по уровню
 * 
 * @param {string} guildID \
 * @param {integer} oldLevel 
 * @param {integer} newLevel 
 */
async function getRolesByLevelRange(guildID, oldLevel, newLevel) {
    const guild = await getLevelGuild(guildID);
    const { roles } = guild;
    const sortedRoles = roles.sort((a, b) => a.level - b.level);
    
    return sortedRoles
        .filter(role => role.level > oldLevel && role.level <= newLevel)
        .map(role => role.roleId);
}

/**
 * Добавить роль за уровень
 * 
 * @param {string} guildID 
 *  @param {string} roleID
 * @param {integer} level 
 */
async function addRoleLevel(guildID, roleID, level) {
    const guild = await getLevelGuild(guildID);
    const { roles } = guild;

    const data = {
        roleId: roleID,
        level: level,
        cleanable: false
    }

    roles.push(data)

    guild.roles = roles;
    levelsDB.put(guildID, guild);

    return true;
}

/**
 * Добавление инфорамции о пользователе на сервере
 * 
 * @param {string} guildID 
 * @param {string} userID 
 */
async function setLevelUserByGuild(guildID, userID) {
    let guild = await getLevelGuild(guildID);
    const data = { user: userID, xp: 0, level: 0, lastMessage: 1 };
    guild.data.push(data);
    levelsDB.put(guildID, guild);

    return data;
}

/**
 * Удаление информации о пользователе на сервере
 * 
 * @param {string} guildID 
 * @param {string} userID 
 */
async function removeLevelUserByGuild(guildID, userID) {
    let guild = await getLevelGuild(guildID);
    guild.data = guild.data.filter(data => data.user !== userID);
    levelsDB.put(guildID, guild);
    return guild;
}

/**
 * Установить минимальное и максимальное значение xp за сообщение на сервере
 * 
 * @param {string} guildID 
 * @param {number} min 
 * @param {number} max 
 */
async function setLevelGuildXp(guildID, min, max) {
    const guild = await getLevelGuild(guildID);
    guild.xp.min = min;
    guild.xp.max = max;
    levelsDB.put(guildID, guild);

    return true;
}


module.exports = {
    MathNextLevel,
    createLevelGuild,
    getLevelGuild,
    setLevelGuildEnabled,
    setLevelGuildChannel,
    setLevelGuildMessage,
    setLevelGuildInterval,
    putLevelUser,
    resetLevelUser,
    getLevelUserByGuild,
    setLevelUserByGuild,
    removeLevelUserByGuild,
    getRolesByLevelRange,
    addRoleLevel,
    setLevelGuildXp,
    setClearLevelsStatus
}