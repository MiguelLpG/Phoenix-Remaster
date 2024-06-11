const { Events } = require('discord.js');
const os = require("os")

module.exports = {
        name: Events.ClientReady,
        once: true,
        execute(client) {


        let dstatus = `/help  -  🔎 ${client.users.cache.size.toLocaleString()}  |  🏠 ${client.guilds.cache.size.toLocaleString()}`

        client.user.setPresence({ activities: [{ name: dstatus }] });

        const ram_1 = Math.ceil((os.totalmem() - os.freemem()) / 1000000)
        const ram_2 = Math.ceil(os.totalmem() / 1000000)

        console.log("[\033[0;34mREADY - EVENTO\033[0;0m] Lanzado correctamente\n[\033[0;34mREADY - EVENTO\033[0;0m] Nombre: " +
                client.user.username +"\n[\033[0;34mREADY - EVENTO\033[0;0m] Servidores: " + client.guilds.cache.size +
                "\n[\033[0;34mREADY - EVENTO\033[0;0m] Usuarios: " + client.users.cache.size +
                "\n[\033[0;34mREADY - EVENTO\033[0;0m] Memoria usada: " +
                (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) +
                " MB\n[\033[0;34mREADY - EVENTO\033[0;0m] Ram usada: " + ram_1 + " MB de " + ram_2 + " MB");
        },
};