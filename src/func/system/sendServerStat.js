async function sendToBoticord(key, client) {
    try {
        await fetch(`https://api.boticord.top/v3/bots/${client.user.id}/stats`, {
            method: "POST",
            body: JSON.stringify({
                "servers": client.guilds.cache.size
            }),
            headers: {
                "Authorization": key,
                "Content-Type": "application/json"
            }
        });
    }
    catch (e) {
        console.log(e);
    }
}

async function sendToSDC(key, client) {
    try {
        await fetch(`https://api.server-discord.com/v2/bots/${client.user.id}/stats`, {
            method: "POST",
            body: JSON.stringify({
                "servers": client.guilds.cache.size,
                "shards": 1
            }),
            headers: {
                "Authorization": "SDC " + key,
                "Content-Type": "application/json"
            }
        });
    }
    catch (e) {
        console.log(e);
    }
}

async function sendToTopGG(key, client) {
    try {
        await fetch(`https://top.gg/api/bots/${client.user.id}/stats`, {
            method: "POST",
            body: JSON.stringify({
                "server_count": client.guilds.cache.size
            }),
            headers: {
                "Authorization": "Bearer " + key,
                "Content-Type": "application/json"
            }
        });
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = {
    sendToBoticord,
    sendToSDC,
    sendToTopGG
}