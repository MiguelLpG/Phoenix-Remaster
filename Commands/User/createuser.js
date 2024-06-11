const { SlashCommandBuilder } = require('discord.js');
const dbModel = require("../../Models/UserDatabase.js");

// Importar rankManager
const rankManager = require('../../Managers/rankManager.js');

// Función para generar un interchatID único
async function generateUniqueInterchatID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let interchatID;
    let isUnique = false;

    while (!isUnique) {
        // Generar un interchatID aleatorio
        interchatID = '#' + Array.from({ length: 5 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        
        // Verificar si el interchatID ya existe en la base de datos
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
            // Verificar si el usuario es el bot
            if (interaction.user.bot) {
                return await interaction.reply({ content: "No se puede crear un perfil para el bot.", ephemeral: true });
            }

            // Buscar el perfil del usuario en la base de datos
            let userProfile = await dbModel.findOne({ userID: interaction.user.id });

            if (userProfile) {
                // Si el perfil existe, informar al usuario que ya tiene una cuenta
                return await interaction.reply({ content: "Ya tienes un perfil creado.", ephemeral: true });
            } else {
                // Generar un interchatID único
                const interchatID = await generateUniqueInterchatID();

                // Si el perfil no existe, crear uno nuevo con los valores por defecto y el interchatID único
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

                // Informar al usuario que se ha creado su perfil
                await interaction.reply({ content: `Perfil de usuario creado correctamente. Tu Interchat ID es ${interchatID}`, ephemeral: true });
            }
        } catch (error) {
            console.error("Error al crear el perfil de usuario:", error);
            await interaction.reply({ content: "Ha ocurrido un error al crear el perfil de usuario.", ephemeral: true });
        }
    },
};
