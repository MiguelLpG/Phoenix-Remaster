const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ChannelType, EmbedBuilder } = require('discord.js');
const MasterConfig = require('./Config/Master.json');
const mongoose = require('mongoose');

const InterchatSettings = require("./Models/InterchatSettings.js");
const sendInterchatMessage = require('./Managers/interchat.js');

// Conexión a MongoDB
mongoose.connect(MasterConfig.dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("[LOG - SYS] Conectado a MongoDB.");
}).catch(err => {
    console.log("[LOG - ERR] Error al conectar a MongoDB: " + err);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.cooldowns = new Collection();
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const fileName = file.substring(0, file.length - 3);
    const event = require(filePath);
    var d = new Date();
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
        console.log("[HANDLER  -  EVENTO] " + fileName + " cargado (" + d.getMilliseconds() + "ms)");
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
        console.log("[HANDLER  -  EVENTO] " + fileName + " cargado (" + d.getMilliseconds() + "ms)");
    }
}

let palabras = [".gg", "www.", ".io", ".com", "discord.gg/", "discord.com/", "discordapp.com/", ".es", "youtu.be", "puto", "gay", "puta", "zorra", "el de arriba", "el de abajo", "polla", "pinga", "al md", "se vende", "unete", "uniros", "unanse", "unirse", "pinche", "pene", "foll", "traga", "join", "raid", "hacked", "ddns.", ".tk", "el admin es", "el mod es", "el admi es", "mamon", "eres un", "perra", "sex", "http://", "https://", "dame nitro", "quiero nitro", "a mi server", "feo", "mierda", "culo", "raided", "paja"]

const palabraEmbed = new EmbedBuilder()
    .setColor("Orange")
    .setTitle("¡Se ha bloqueado tu mensaje!")
    .setDescription("Nuestros sitemas han determinado que tu mensaje contenia contenido inapropiado o no permitido, por lo que no ha sido enviado. \n\nSi crees que esto es un error, contacta con el equipo de soporte.")

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type != ChannelType.GuildText) return;

    const interchatSetting = await InterchatSettings.findOne({ guildID: message.guild.id, channelID: message.channel.id });
    if (!interchatSetting) return;

    const messageContent = message.content.toLowerCase();

    if (palabras.some(palabra => messageContent.includes(palabra))) {
        await message.delete()
        return message.channel.send({ content: `<@${message.author.id}>`, embeds: [palabraEmbed] })
    }

    // ver si el mensaje es una respuesta
    if (message.reference && message.reference.messageId) {
        const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
        if (originalMessage) {
            const embed = originalMessage.embeds[0];
            const originalAuthorTag = embed.author.name;
            const originalMessageContent = embed.description; // obtener el mensaje original

            const user = client.users.cache.find(u => u.tag === originalAuthorTag);
            if (user) {
                sendInterchatMessage(client, message, user, originalMessageContent);
                return;
            }
        }
    }

    sendInterchatMessage(client, message);
});

try {
    client.login(MasterConfig.token).then(() => {
        console.log("[CLIENT - LOG] El bot ha iniciado sesión.");
    });
} catch (e) {
    console.log("[CLIENT - ERR] Error al iniciar sesión: " + e);
}
