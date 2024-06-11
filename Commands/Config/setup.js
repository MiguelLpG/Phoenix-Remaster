const { ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const db = require('mongoose');

module.exports = {
	category: "Config",
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Setup the basic settings of the bot in your server.'),
	async execute(client, interaction) {
        if(interaction.guild.fetchOwner != interaction.user.id) return interaction.reply("Solamente el dueño del servidor puede ejecutar este comando.")

		
	},
};