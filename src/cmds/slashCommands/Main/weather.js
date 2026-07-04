const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SectionBuilder, MediaGalleryBuilder, FileBuilder } = require("discord.js");
const { emojis } = require("../../../config.js");
const weather = require("../../../func/apis/weather.js");
const { GiveAchievement } = require('../../../func/games/giveAch.js');

const dayNames = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

const airQuality = {
  1: "Хорошее",
  2: "Удовлетворительное",
  3: "Вредное для чувствительных групп",
  4: "Вредное",
  5: "Очень вредное",
  6: "Опасное"
}

module.exports = {
  category: "utility",
  cooldown: 1,
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Узнать погоду")
    .addStringOption((option) =>
      option
        .setName("город")
        .setDescription("Город, погоду в котором надо узнать")
        .setRequired(true)
    ),
  async execute(interaction, guild) {
    const city = interaction.options.getString("город");
    await interaction.deferReply();

    const response = await weather.forecast(process.env.WEATHER_API_KEY, city, 5);

    if(response === "error") return interaction.editReply(`${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`);
    if(response.error) {
      if(response.error.code == 1006) return interaction.editReply(`${emojis.error} | К сожалению, город \`${city}\` не найден!`);
      return interaction.editReply(`${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`);
    }

    const { location, current, forecast } = response;

    const dates_for_chart = forecast.forecastday.slice(0, 3).map(d => new Date(d.date_epoch * 1000).toLocaleDateString("ru-RU", { month: "2-digit", day: "2-digit" }));
    const day3_name = dayNames[new Date(forecast.forecastday[2].date_epoch * 1000).getDay()];
    const date_names = forecast.forecastday.slice(0, 3).map(d => new Date(d.date_epoch * 1000).toLocaleDateString("ru-RU", { month: "long", day: "numeric" }));

    const chart = `https://quickchart.io/chart?width=300&height=200&devicePixelRatio=1&c={type:%27line%27,data:{labels:[%27${dates_for_chart[0]}%2000:00%27,%2706:00%27,%2712:00%27,%2718:00%27,%27${dates_for_chart[1]}%2000:00%27,%2706:00%27,%2712:00%27,%2718:00%27,%27${dates_for_chart[2]}%2000:00%27,%2706:00%27,%2712:00%27,%2718:00%27],datasets:[{label:%27%D0%A2%D0%B5%D0%BC%D0%BF%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B0%27,data:[${forecast.forecastday[0].hour[0].temp_c},${forecast.forecastday[0].hour[6].temp_c},${forecast.forecastday[0].hour[12].temp_c},${forecast.forecastday[0].hour[18].temp_c},${forecast.forecastday[1].hour[0].temp_c},${forecast.forecastday[1].hour[6].temp_c},${forecast.forecastday[1].hour[12].temp_c},${forecast.forecastday[1].hour[18].temp_c},${forecast.forecastday[2].hour[0].temp_c},${forecast.forecastday[2].hour[6].temp_c},${forecast.forecastday[2].hour[12].temp_c},${forecast.forecastday[2].hour[18].temp_c}],fill:true,borderColor%3A%27rgba%2863%2C+204%2C+101%2C+1%29%27%2CbackgroundColor%3A%27rgba%2863%2C+204%2C+101%2C+0.3%29%27%7D]}}`;

    const message = {
      "flags": 32768,
      "components": [
        {
          "type": 17,
          "components": [
            {
              "type": 10,
              "content": `# ${location.name}, ${location.country}\n### ${current.condition.text}\nСейчас **${current.temp_c}°C**\nОщущается как **${current.feelslike_c}°C**`
            },
            {
              "type": 14,
              "spacing": 1,
              "divider": true
            },
            {
              "type": 9,
              "components": [
                {
                  "type": 10,
                  "content": `## Сегодня, ${date_names[0]}`
                },
                {
                  "type": 10,
                  "content": `${forecast.forecastday[0].day.condition.text}`
                },
                {
                  "type": 10,
                  "content": `**${forecast.forecastday[0].day.maxtemp_c}°C / ${forecast.forecastday[0].day.mintemp_c}°C**`
                }
              ],
              "accessory": {
                "type": 11,
                "media": {
                  "url": `https:${forecast.forecastday[0].day.condition.icon}`
                }
              }
            },
            {
              "type": 9,
              "components": [
                {
                  "type": 10,
                  "content": `## Завтра, ${date_names[1]}`
                },
                {
                  "type": 10,
                  "content": `${forecast.forecastday[1].day.condition.text}`
                },
                {
                  "type": 10,
                  "content": `**${forecast.forecastday[1].day.maxtemp_c}°C / ${forecast.forecastday[1].day.mintemp_c}°C**`
                }
              ],
              "accessory": {
                "type": 11,
                "media": {
                  "url": `https:${forecast.forecastday[1].day.condition.icon}`
                }
              }
            },
            {
              "type": 9,
              "components": [
                {
                  "type": 10,
                  "content": `## ${day3_name}, ${date_names[2]}`
                },
                {
                  "type": 10,
                  "content": `${forecast.forecastday[2].day.condition.text}`
                },
                {
                  "type": 10,
                  "content": `**${forecast.forecastday[2].day.maxtemp_c}°C / ${forecast.forecastday[2].day.mintemp_c}°C**`
                }
              ],
              "accessory": {
                "type": 11,
                "media": {
                  "url": `https:${forecast.forecastday[2].day.condition.icon}`
                }
              }
            },
            {
              "type": 14,
              "spacing": 2,
              "divider": false
            },
            {
              "type": 12,
              "items": [
                {
                  "media": {
                    "url": chart
                  }
                }
              ]
            },
            {
              "type": 14,
              "spacing": 1,
              "divider": true
            },
            {
              "type": 10,
              "content": `Влажность: **${current.humidity}%**\nВетер: **${(current.wind_kph / 3.6).toFixed(1)} м/с**\nДавление: **${(current.pressure_mb/1.333).toFixed(0)} мм рт. ст.**\nВероятность осадков: **${current.chance_of_rain || current.chance_of_snow || 0} %**\nКачество воздуха: **${airQuality[current.air_quality["us-epa-index"]]}**`
            },
            {
              "type": 10,
              "content": "-# Сервис: WeatherApi 💖"
            }
          ]
        }
      ]
    };

    if (current.air_quality["us-epa-index"] >= 3) {
      GiveAchievement(18, interaction.user.id, interaction.channel, guild)
    }

    return interaction.editReply(message)
  },
};
