const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const MasterConfig = require('./Config/Master.json');
const db = require("mongoose");

db.connect(MasterConfig.dbURL, { useNewUrlParser: true, useUnifiedTopology: true });

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
        console.log("[\033[0;32mHANDLER - EVENTO\033[0m] >>> \033[0;36m" + fileName + "\033[0m >> cargado (" + d.getMilliseconds() + "ms)");
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
        console.log("[\033[0;32mHANDLER - EVENTO\033[0m] >>> \033[0;36m" + fileName + "\033[0m >> cargado (" + d.getMilliseconds() + "ms)");
    }
}

try {
    client.login(MasterConfig.token).then(() => {
        console.log("[\033[0;32mLOG - SYS\033[0m] El bot ha iniciado sesión.");
    });
} catch (e) {
    console.log("[\033[0;31mLOG - ERR\033[0m] Error al iniciar sesión: " + e);
}
