const { SlashCommandBuilder } = require('discord.js');
const dbModel = require("../../Models/UserDatabase.js");
const rankManager = require('../../Managers/rankManager.js');

async function generateUniqueInterchatID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let interchatID;
    let isUnique = false;

    while (!isUnique) {
        interchatID = '#' + Array.from({ length: 5 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        
        const existingUser = await dbModel.findOne({ interchatID: interchatID });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return interchatID;
}

module.exports = {
    category: "User",
    data: new SlashCommandBuilder()
        .setName('createuser')
        .setDescription('Crear un perfil de usuario.'),
    async execute(interaction, client) {
        try {
            if (interaction.user.bot) {
                return await interaction.reply({ content: "No se puede crear un perfil para el bot.", ephemeral: true });
            }
            let userProfile = await dbModel.findOne({ userID: interaction.user.id });

            if (userProfile) {
                return await interaction.reply({ content: "Ya tienes un perfil creado.", ephemeral: true });
            } else {
                const interchatID = await generateUniqueInterchatID();

                let newUserProfile = new dbModel({
                    userID: interaction.user.id,
                    apodo: "Sin apodo",
                    rank: [rankManager.Usuario.id],
                    dinero: 0,
                    isVip: false,
                    fechaCreacion: new Date(),
                    badges: [],
                    blacklist: false,
                    interchatID: interchatID
                });
                await newUserProfile.save();

                await interaction.reply({ content: `Perfil de usuario creado correctamente. Tu Interchat ID es ${interchatID}`, ephemeral: true });
            }
        } catch (error) {
            console.error("Error al crear el perfil de usuario:", error);
            await interaction.reply({ content: "Ha ocurrido un error al crear el perfil de usuario.", ephemeral: true });
        }
    },
};
