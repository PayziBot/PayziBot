async function getServer(ip) {
    try {
        const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(ip)}`);
        const r = await res.json();
        return r;
    }
    catch (e) {
        console.log(e);
        return 'error';
    }
}

async function getPlayer(name) {
    try {
        const res = await fetch(`https://playerdb.co/api/player/minecraft/${name}`);
        const r = await res.json();
        return r;
    }
    catch (e) {
        return 'error';
    }
}


module.exports = {
    getServer,
    getPlayer
};