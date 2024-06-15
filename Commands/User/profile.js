const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const dbModel = require("../../Models/UserDatabase.js");
const rankManager = require('../../Managers/rankManager.js');

module.exports = {
    cooldown: 5,
    category: "User",
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Podras ver la información de algun usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario para ver su información')
                .setRequired(false)),
    async execute(interaction, client) {

        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const robot = {
            true: "Si es Bot",
            false: "No es Bot"
        };
        const badges = {
            staff: "",
            partner:"<:discordpartner:1249770285473857558>",
            bugHunterLevel1: "<:discordbughunter1:1249770278939132044>",
            HypeSquadOnlineHouse3: "<:hypesquadbalance:1249770292499185758>",
            bugHunterLevel2: "<:discordbughunter2:1249770279912345721>",
            ActiveDeveloper: "<:activedeveloper:1249770274652684319>",
            verifiedDeveloper: "<:discordbotdev:1249770277320134818>",
            premiumEarlySupporter: "",
            verifiedBot: "",

            HYPESQUAD_EVENTS: "<:hypesquadevents:1249770359448928356>",
            HOUSE_BRAVERY: "",
            HOUSE_BRILLIANCE: "",
            TEAM_USER: "",
            SYSTEM: ""
        };
        const roles1 = member.roles.cache.map(role => role.toString()).join(" - ");
        if (roles1.length > 1024) {
            return interaction.reply({ content: "❌ `|` **Tus roles superan los 1024 caracteres, por esa razón no se puede mostrar tu info**", ephemeral: true });
        }
        function formatDate(template, date) {
            const specs = 'YYYY:MM:DD:HH:mm:ss'.split(':');
            date = new Date(date || Date.now() - new Date().getTimezoneOffset() * 6e4);
            return date.toISOString().split(/[-:.TZ]/).reduce((template, item, i) => {
                return template.split(specs[i]).join(item);
            }, template);
        }

        const embedUser = new EmbedBuilder()
            .setColor("Random")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setAuthor({ name: `Info/Estadísticas ${user.username}`, iconURL: client.user.displayAvatarURL() })
            .addFields(
                { name: "👤 `|` **__Nombre:__**", value: user.username, inline: true },
                { name: "🆔 `|` **__ID:__**", value: user.id, inline: true },
                { name: "📷 `|` **__Avatar:__**", value: `**[Click Aquí](${user.displayAvatarURL()})**`, inline: true },
                { name: "👀 `|` **__Alias:__**", value: member.nickname ? member.nickname : "No tiene Alias", inline: true },
                { name: "🤖 `|` **__Bot?__**", value: robot[user.bot], inline: true },
                { name: "📅 `|` **__Fecha Creación:__**", value: formatDate('DD/MM/YYYY, a las HH:mm:ss', user.createdAt), inline: true },
                { name: "📱 `|` **__Registro de ingreso:__**", value: formatDate('DD/MM/YYYY, a las HH:mm:ss', member.joinedAt), inline: true },
                {
                    name: "🌟 `|` **__Insignias:__**",
                    value: user.flags && user.flags.toArray().length > 0
                        ? user.flags.toArray().map(flag => badges[flag] || flag).join(' ')
                        : "**No tiene Insignias**",
                    inline: true
                },
                { name: "📃 `|` **__Info Roles:__**", value: `» **Role Superior:** <@&${member.roles.highest.id}> \n» **Role que le da color:** <@&${member.roles.color?.id || member.roles.highest.id}> \n» **Roles:** ${roles1}` }
            )
            .setFooter({ text: "Información del usuario", iconURL: client.user.displayAvatarURL() });

        const interchatInfoProf = await dbModel.findOne({ userID: user.id });

        if (!interchatInfoProf) {
            return interaction.reply({ content: "Para usar este comando debes tener una cuenta en Conecta!, crea una con `/createuser`.", ephemeral: true });
        }

        const rangoUsuario = rankManager[interchatInfoProf.rank[0]];
        const nombreRango = rangoUsuario ? rangoUsuario.nombre : "Sin rango";

        const embedInterchat = new EmbedBuilder()
            .setColor("Random")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setAuthor({ name: `Info/Estadísticas ${user.username}`, iconURL: client.user.displayAvatarURL() })
            .addFields(
                { name: " `|` **__Discord:__**", value: user.username, inline: true },
                { name: "🆔 `|` **__HASH:__**", value: interchatInfoProf.interchatID, inline: true },
                { name: " `|` **__Apodo:__**", value: interchatInfoProf.apodo ? interchatInfoProf.apodo : "ERROR", inlnie: true },
                { name: " `|` **__Registro Conecta!__**", value: interchatInfoProf.fechaCreacion.toString(), inline: true },
                {
                    name: " `|` **__Insignias:__**",
                    value: interchatInfoProf && interchatInfoProf.badges.length > 0
                        ? interchatInfoProf.badges.join(' ')
                        : "**No tiene Insignias**",
                    inline: true
                },
                {
                    name: "Dinero ",
                    value: interchatInfoProf.dinero.toString(),  
                    inline: true
                },
                {
                    name: "Rango ",
                    value: nombreRango,
                    inline: true
                },
                { name: " `|` **__Info Roles:__**", value: `» **Role Superior:** <@&${member.roles.highest.id}> \n» **Role que le da color:** <@&${member.roles.color?.id || member.roles.highest.id}> \n» **Roles:** ${roles1}` }
            )
            .setFooter({ text: "Información del usuario en Conecta!", iconURL: client.user.displayAvatarURL() });

        const userProfile = new ButtonBuilder()
            .setCustomId('userProfile')
            .setLabel('Perfil de Discord')
            .setStyle(ButtonStyle.Primary);

        const interProfile = new ButtonBuilder()
            .setCustomId('interProfile')
            .setLabel('Perfil de Conecta!')
            .setStyle(ButtonStyle.Success);

        const botonesSend = new ActionRowBuilder()
            .addComponents(userProfile, interProfile);

        async function sendProfileEmbed(embed) {
            await interaction.editReply({ embeds: [embed], components: [botonesSend] });
        }

        const sendMsg = await interaction.reply({ embeds: [embedUser], components: [botonesSend], fetchReply: true });

        const collectorFilter = i => i.user.id === interaction.user.id;

        const collector = sendMsg.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'userProfile') {
                await i.update({ embeds: [embedUser], components: [botonesSend] });
            } else if (i.customId === 'interProfile') {
                await i.update({ embeds: [embedInterchat], components: [botonesSend] });
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({ components: [] });
            }
        });
    }
};