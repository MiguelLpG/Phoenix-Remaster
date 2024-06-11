const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const mongoose = require('mongoose');
const InterchatSettings = require("../../Models/InterchatSettings");

module.exports = {
    category: "Config",
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the basic settings of the bot in your server.'),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });

		const existingSettings = await InterchatSettings.findOne({ guildID: interaction.guild.id });
        if (existingSettings) {
            return interaction.editReply({ content: 'El servidor ya tiene una configuración de Interchat.' });
        }

        const setup1 = new EmbedBuilder()
            .setTitle("Conecta! Setup (1/3)")
            .setColor("#57F287")
            .setDescription(`
                :flag_es:  Por favor, selecciona un idioma para comenzar la configuración.
                :flag_us:  Please select a language to start the setup
                :flag_fr:  Veuillez sélectionner une langue pour commencer la configuration.`
            );

        const botonES = new ButtonBuilder()
            .setCustomId("botonES")
            .setEmoji("🇪🇸")
            .setStyle(ButtonStyle.Primary);
        const botonUS = new ButtonBuilder()
            .setCustomId("botonUS")
            .setEmoji("🇺🇸")
            .setStyle(ButtonStyle.Primary);
        const botonFR = new ButtonBuilder()
            .setCustomId("botonFR")
            .setEmoji("🇫🇷")
            .setStyle(ButtonStyle.Primary);
        const rowBotonesPaises = new ActionRowBuilder()
            .addComponents(botonES, botonUS, botonFR);

        await interaction.editReply({
            embeds: [setup1], components: [rowBotonesPaises]
        });

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

            let svLangSet;
            if (confirmation.customId === "botonES") svLangSet = "es";
            if (confirmation.customId === "botonUS") svLangSet = "en";
            if (confirmation.customId === "botonFR") svLangSet = "fr";

            const setupLang = require(`../../Languages/${svLangSet}.json`);

            const channelSelectorSetup = new ChannelSelectMenuBuilder()
                .setCustomId('channelSelectorSetup')
                .setChannelTypes(ChannelType.GuildText);
            const row22Channel = new ActionRowBuilder()
                .addComponents(channelSelectorSetup);

            const setup2 = new EmbedBuilder()
                .setTitle("Setup (2/3)")
                .setColor("#57F287")
                .setDescription(setupLang.setup.step1Confirm);

            await confirmation.update({ embeds: [setup2], components: [row22Channel] });

            const confirmationChannel = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 180000 });

            const setup3 = new EmbedBuilder()
                .setTitle("Conecta! Setup (3/3)")
                .setColor("#0000ff")
                .setDescription(setupLang.setup.step2Confirm.replace(/%%/g, confirmationChannel.values[0]));

            await confirmationChannel.update({ embeds: [setup3], components: [] });

            const guildOwner = (await interaction.guild.fetchOwner()).id;

            const newSettings = new InterchatSettings({
                guildID: interaction.guild.id,
                channelID: confirmationChannel.values[0],
                isVip: "false",
                guildOwner: guildOwner
            });

            await newSettings.save();


			const embedRulesFinal = new EmbedBuilder()
				.setTitle(setupLang.rules.title)
				.setColor("Orange")
				.setDescription(`${setupLang.rules.text}\n\n${setupLang.rules.rule1}\n${setupLang.rules.rule2}\n${setupLang.rules.rule3}\n${setupLang.rules.rule4}\n${setupLang.rules.rule5}\n${setupLang.rules.rule6}\n${setupLang.rules.rule7}\n${setupLang.rules.rule8}`)

            const channelSendMsg = interaction.guild.channels.cache.get(confirmationChannel.values[0]);
            await channelSendMsg.send({ embeds: [embedRulesFinal] });

        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'Ha ocurrido un error o no has respondido a tiempo. Por favor, intenta nuevamente.' });
        }
    },
};
