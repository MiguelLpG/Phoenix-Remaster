const { Events, Collection, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
    
        if (!command) {
            console.error(`No se ha encontrado el comando ${interaction.commandName}.`);
            return;
        }
    
        const { cooldowns } = client;
    
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }
    
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
    
        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({ content: `Debes esperar para utilizar el comando \`${command.data.name}\`. Podrás volver a utilizarlo en <t:${expiredTimestamp}:R>.`, ephemeral: true });
            }
        }
    
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        let guildError = client.guilds.cache.get('1248946023536005151');
        let canalError = guildError.channels.cache.get('1249644174676852777');

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            const embedError = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(`❌ Ha ocurrido un error al ejecutar un comando.`)
                .setDescription(`El usuario que ejecutó el comando fue ${interaction.user.username}, su ID es ${interaction.user.id}`)
                .addFields(
                    { name: "🚀 **Comando**", value: command.data.name, inline: true },
                    { name: "🖥️ **Guild**", value: interaction.guild.name, inline: true },
                    { name: "🐛 **Error**", value: "```" + error.message + "```" },
                    { name: "🔎 **Output**", value: "```" + error + "```" }
                )
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '¡A ocurrido un error al ejecutar este comando! No te preocupes, he notificado a mis desarrolladores.', ephemeral: true });
            } else {
                await interaction.reply({ content: '¡A ocurrido un error al ejecutar este comando! No te preocupes, he notificado a mis desarrolladores.', ephemeral: true });
            }

            await canalError.send({ embeds: [embedError] });
        }
    },
};
