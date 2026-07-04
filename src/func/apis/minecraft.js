async function getServer(ip) {
    await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(ip)}`).then(r => r.json()).then(r => {
        return r;
    }).catch(e => {
        console.log(e);
        return 'error';
    });
}

async function getPlayer(name) {
    let answer;
    await fetch(`https://playerdb.co/api/player/minecraft/${name}`).then(r => r.json()).then(r => {
        return r;
    }).catch(e => {
        console.log(e);
        return 'error';
    });
}


module.exports = {
    getServer,
    getPlayer
};