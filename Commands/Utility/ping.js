const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    category: "Utility",
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction, client) { 
        const initPing = Date.now();
        const pingeandoEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setDescription('Obteniendo ping...');
        await interaction.reply({ embeds: [pingeandoEmbed] });

        if (client.ws && client.ws.ping) {
            let ping_msg = (Date.now() - initPing);
            let ws_ping = client.ws.ping;
            let ping_total = (ping_msg + ws_ping);

            let pingTotalFinal = "🟢 `|` Baja";
            let pingMsgFinal = "🟢";
            let letApiPing = "🟢";

            let embedColor = "#00FF00";

            if (ping_total > 600) {
                pingTotalFinal = "🟡 `|` Media";
                embedColor = "#FFFF00";
            }
            if (ping_total > 1200) {
                pingTotalFinal = "🔴 `|` Alta";
                embedColor = "#CC0000";
            }

            if (ping_msg > 100) pingMsgFinal = "🟡";
            if (ping_msg > 200) pingMsgFinal = "🔴";

            if (ws_ping > 100) letApiPing = "🟡";
            if (ws_ping > 200) letApiPing = "🔴";

            if (0 > ping_total) pingTotalFinal = "**Error en la medida.**";

            const pingEmbedFinal = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`⏳ Estado general de la latencia: ${pingTotalFinal}`)
                .setDescription(`:speech_balloon: Latencia de los mensajes: ${pingMsgFinal} \`${ping_msg}\` **ms**
                :satellite_orbital: Latencia del WebSocket: ${letApiPing} \`${ws_ping}\` **ms**`
                )
                .setTimestamp();
            await interaction.editReply({ embeds: [pingEmbedFinal] });

        } else {
            await interaction.editReply({ content: 'Ha ocurrido un error a la hora de obtener el ping del websocket.' });
        }
    },
};
