const { EmbedBuilder } = require("discord.js");
const rankManager = require('./rankManager.js');
const InterchatSettings = require("../Models/InterchatSettings.js");
const UserDatabase = require("../Models/UserDatabase.js");

let interchatMessages = {};

async function generateUniqueInterchatID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let interchatID;
    let isUnique = false;

    while (!isUnique) {
        interchatID = '#' + Array.from({ length: 5 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        
        const existingUser = await UserDatabase.findOne({ interchatID: interchatID });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return interchatID;
}

async function sendInterchatMessage(client, message, replyToUser = null, originalMessageContent = null) {
    const user = message.author;
    let interchatInfoProf = await UserDatabase.findOne({ userID: user.id });

    if (!interchatInfoProf) {
        const interchatID = await generateUniqueInterchatID();
        
        interchatInfoProf = new UserDatabase({
            userID: user.id,
            apodo: "Sin apodo",
            rank: rankManager.Usuario.id,
            dinero: 0,
            isVip: false,
            fechaCreacion: new Date(),
            badges: [],
            blacklist: false,
            interchatID: interchatID
        });
        await interchatInfoProf.save();

        const dmEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Configuración de Interchat Creada')
            .setDescription(`Hola ${user.username}! He creado automáticamente una configuración de Interchat para ti, pues no tenías una. Tu Interchat ID es **${interchatID}**.`);

        user.send({ embeds: [dmEmbed] })
            .catch(err => console.error(`No se pudo enviar el mensaje privado a ${user.tag}:`, err));
    }

    const rangoUsuario = rankManager[interchatInfoProf.rank];

    if (!rangoUsuario) {
        console.error(`No se encontró el rango: ${interchatInfoProf.rank}`);
    }

    const nombreRango = rangoUsuario ? rangoUsuario.nombre : "Sin rango";
    const hashUsuario = interchatInfoProf.interchatID;

    const guilds = Array.from(client.guilds.cache.values());
    let index = 0;

    const sendMessage = async () => {
        if (index >= guilds.length) return;

        const srv = guilds[index];
        try {
            const interchatSettings = await InterchatSettings.find({ guildID: srv.id });

            if (interchatSettings.length > 0) {
                for (const setting of interchatSettings) {
                    const interchatChannel = client.channels.cache.get(setting.channelID);
                    if (interchatChannel) {
                        let description;
                        if (replyToUser) {
                            description = `*<@${user.id}> ha respondido a <@${replyToUser.id}>:*\n> ${message.content}\n\n**Mensaje original:**\n ${originalMessageContent}`;
                        } else {
                            description = `> ${message.content}`;
                        }

                        const embed = new EmbedBuilder()
                            .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(description)
                            .setColor(rangoUsuario.embedColor || "Aqua")
                            .setFooter({ text: `Rango: ${nombreRango} | Hash: ${hashUsuario}` });

                        const sentMessage = await interchatChannel.send({ embeds: [embed] });
                        if (!replyToUser) {
                            interchatMessages[sentMessage.id] = { user, message };
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error al procesar el servidor ${srv.name}:`, e);
        }

        index++;
        setTimeout(sendMessage, 250); // 0.25 segundos de retraso entre cada mensaje para evitar ratelimit
    };

    sendMessage();
}

module.exports = sendInterchatMessage;
