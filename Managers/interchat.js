const { EmbedBuilder } = require("discord.js");
const rankManager = require('./rankManager.js');
const InterchatSettings = require("../Models/InterchatSettings.js");
const UserDatabase = require("../Models/UserDatabase.js");

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

module.exports = async (client, message) => {
    const user = message.author;
    let interchatInfoProf = await UserDatabase.findOne({ userID: user.id });

    if (!interchatInfoProf) {
        console.log(`No se encontró la configuración de interchat para el usuario: ${user.id}, creando una nueva.`);
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
            .setDescription(`Hola ${user.username}, se ha creado automáticamente una configuración de Interchat para ti porque no tenías una. Tu Interchat ID es **${interchatID}**.`);

        user.send({ embeds: [dmEmbed] })
            .catch(err => console.error(`No se pudo enviar el mensaje privado a ${user.tag}:`, err));
    }

    console.log(`Rango del usuario: ${interchatInfoProf.rank}`);
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

                    const nombreRank = rangoUsuario.texto;
                    const finalRank = nombreRank.replace("%%", "https://discord.gg/rqF24yX5")

                    if (interchatChannel) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            //.setDescription(message.content)
                            .setDescription(`
                                > ${message.content}

                                [*Unirse al servidor **${srv.name}***](https://discord.com/developers/applications)
                                `)
                            .setColor(rangoUsuario.embedColor)
                            .setFooter({ text: `Rango: ${nombreRango} | Hash: ${hashUsuario}` });

                        interchatChannel.send({ embeds: [embed] })
                            .then(() => console.log(`Mensaje enviado a ${srv.name} en el canal ${interchatChannel.id}`))
                            .catch(err => console.error(`No se pudo enviar el mensaje a ${srv.name} en el canal ${interchatChannel.id}:`, err));
                    }
                }
            }
        } catch (e) {
            console.error(`Error al procesar el servidor ${srv.name}:`, e);
        }

        index++;
        setTimeout(sendMessage, 250);
    };

    sendMessage();
};
