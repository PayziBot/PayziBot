const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { emojis } = require("../../../config.js");
const weather = require("../../../func/apis/weather.js");
const { CheckAch } = require('../../../func/games/giveAch.js');

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

    const r = await weather.current(process.env.WEATHER_API_KEY, city);
    if (r === "error")
      return interaction.editReply(`${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`);
    if (r.error) {
      if (r.error.code == 1006)
        return interaction.editReply(`${emojis.error} | К сожалению, город \`${city}\` не найден!`);
      interaction.editReply(
        `${emojis.error} | Произошли технические неполадки, но мы уже работаем над их устранением!`
      );
    }
    const embed = new EmbedBuilder()
      .setTitle(r.location.name + ", " + r.location.country)
      .setDescription(`${emojis.arrow} ${r.current.condition.text}`)
      .addFields(
        {
          name: "Температура",
          value: `Сейчас: **${r.current.temp_c}°C**\nПо ощущениям: **${r.current.feelslike_c}°C**`,
          inline: true,
        },
        {
          name: "Прочее",
          value: `Влажность: **${r.current.humidity}%**\nВетер: **${(
            r.current.wind_kph / 3.6
          ).toFixed(1)} м/с**\nДавление: **${r.current.pressure_mb
            } мм рт. ст.**\nВероятность осадков: **${r.current.chance_of_rain || r.current.chance_of_snow || 0} %**\nКачество воздуха: **${airQuality[r.current.air_quality["us-epa-index"]]}**`,
          inline: false,
        }
      )
      .setThumbnail("https:" + r.current.condition.icon)
      .setColor(guild.colors.basic)
      .setFooter({
        text: "Сервис: WeatherApi 💖",
      });

    if (r.current.air_quality["us-epa-index"] >= 2) {
      CheckAch(18, interaction.user.id, interaction.channel, guild)
    }

    const threedaysweather = new ButtonBuilder()
      .setCustomId("threedaysweather")
      .setLabel("Погода на 3 дня")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(threedaysweather);

    const response = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
    const collectorFilter = (i) => i.user.id === interaction.user.id;
    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60_000,
      });

      if (confirmation.customId === "threedaysweather") {
        const wea = await weather.forecast(process.env.WEATHER_API_KEY, city, 5);
        data = wea;
        day2s = dayNames[new Date(wea[2].date_epoch * 1000).getDay()];

        day1 = new Date(data[0].date_epoch * 1000);
        day1 = day1.toLocaleDateString("ru-RU", {
          month: "2-digit",
          day: "2-digit",
        });
        day2 = new Date(data[1].date_epoch * 1000);
        day2 = day2.toLocaleDateString("ru-RU", {
          month: "2-digit",
          day: "2-digit",
        });
        day3 = new Date(data[2].date_epoch * 1000);
        day3 = day3.toLocaleDateString("ru-RU", {
          month: "2-digit",
          day: "2-digit",
        });

        stringa = `https://quickchart.io/chart?c={type:%27line%27,data:{labels:[%27${day1}%2000:00%27,%2706:00%27,%2712:00%27,%2718:00%27,%27${day2}%2000:00%27,%2706:00%27,%2712:00%27,%2718:00%27,%27${day3}%2000:00%27,%2706:00%27,%2712:00%27,%2718:00%27],datasets:[{label:%27%D0%A2%D0%B5%D0%BC%D0%BF%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B0%27,data:[${data[0].hour[0].temp_c},${data[0].hour[6].temp_c},${data[0].hour[12].temp_c},${data[0].hour[18].temp_c},${data[1].hour[0].temp_c},${data[1].hour[6].temp_c},${data[1].hour[12].temp_c},${data[1].hour[18].temp_c},${data[2].hour[0].temp_c},${data[2].hour[6].temp_c},${data[2].hour[12].temp_c},${data[2].hour[18].temp_c}],fill:true,borderColor%3A%27rgba%2863%2C+204%2C+101%2C+1%29%27%2CbackgroundColor%3A%27rgba%2863%2C+204%2C+101%2C+0.3%29%27%7D]}}`;

        const fdw = new EmbedBuilder()
          .setTitle(r.location.name + ", " + r.location.country)
          .addFields(
            {
              name: "Сегодня",
              value: `>>> ${wea[0].day.condition.text}\n**${wea[0].day.maxtemp_c}°C** / **${wea[0].day.mintemp_c}°C**`,
              inline: true,
            },
            {
              name: "Завтра",
              value: `>>> ${wea[1].day.condition.text}\n**${wea[1].day.maxtemp_c}°C** / **${wea[1].day.mintemp_c}°C**`,
              inline: true,
            },
            {
              name: `${day2s}`,
              value: `>>> ${wea[2].day.condition.text}\n**${wea[2].day.maxtemp_c}°C** / **${wea[2].day.mintemp_c}°C**`,
              inline: false,
            }
          )
          .setThumbnail("https:" + r.current.condition.icon)
          .setColor(guild.colors.basic)
          .setImage(stringa)
          .setFooter({
            text: "Сервис: WeatherApi 💖",
          });
        await interaction.editReply({ embeds: [fdw], components: [] });
      }
    } catch (e) {
      if (e.message.includes("messageDelete")) return;
      await interaction.editReply({ embeds: [embed], components: [] });
    }
  },
};
