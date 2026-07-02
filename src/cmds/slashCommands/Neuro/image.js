const { SlashCommandBuilder } = require("discord.js");
const { GiveAchievement } = require('../../../func/games/giveAch.js');
const { emojis } = require('../../../config.js');

const { RsnChat } = require('rsnchat');
const rsnchat = new RsnChat(process.env.RSN_API_KEY);

module.exports = {
    category: 'neuro',
    cooldown: 30,
    skip: true,
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Генерация изображения')
        .addStringOption((option) =>
            option.setName('запрос')
                .setDescription('Опишите картинку, которую хотите получить')
                .setMaxLength(256)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('модель')
                .setDescription('Модель для генерации картинки')
                .setRequired(false) // ЗАМЕНИТЬ НА TRUE
                .addChoices(
                    { name: 'Flux', value: 'flux' }
                )
        ),
    async execute(interaction, guild, user) {
        await interaction.deferReply();

        const negative = "blury, bad quality, nsfw";
        const model = interaction.options.getString('модель') || 'flux';
        const text = interaction.options.getString('запрос');

        interaction.editReply(`${emojis.loading} | Генерируем картинку...`)

        async function AfterGen(image) {
            interaction.editReply({
                content: `🖼️ Вот ваша замечательная картинка!\n-# Запрос: ${text.replace('`', '\`')}`,
                files: [{ attachment: image, name: 'image.png' }]
            })
            GiveAchievement(9, interaction.user.id, interaction.channel, guild, user)
        }

        if (model === 'flux') {
            await rsnchat.image(text, 'flux')
                .then(response => {
                    AfterGen(response.image_url)
                }).catch(() => {
                    interaction.editReply(`${emojis.error} | Ошибка. Попробуйте позже или выберите другую модель`)
                    return
                });
        }
    },
};
