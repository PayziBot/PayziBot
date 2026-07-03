async function current(key, city) {
    let answer;
    await fetch(`http://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(city)}&lang=ru&aqi=yes`).then(r => r.json()).then(r => {
        answer = r;
    }).catch(e => {
        console.log(e);
        answer = 'error';
    });
    return answer;
}

async function forecast(key, city, days) {
    let answer;
    await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(city)}&lang=ru&days=${days}&aqi=yes`).then(r => r.json()).then(r => {
        answer = r;
    }).catch(e => {
        console.log(e);
        answer = 'error';
    });
    return answer;
}

module.exports = {
    current,
    forecast
};