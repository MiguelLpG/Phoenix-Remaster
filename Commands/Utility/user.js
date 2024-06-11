const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: "Utility",
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(client, interaction) {
		await interaction.reply(`This command was run by ${interaction.user.username}, su id es${interaction.user.id}, who joined on ${interaction.member.joinedAt}.`);
	},
};