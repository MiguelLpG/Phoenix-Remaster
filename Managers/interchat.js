module.exports = async (client, message) => {

    const db = require("mongoose")
    const rankManager = require('./rankManager.js');
    const dbModel = require("../Models/InterchatSettings.js")
    const user = message.author.id;
    const interchatInfoProf = await dbModel.findOne({ userID: user.id });

    
    //const rangoUsuario = rankManager[interchatInfoProf.rank[0]];
    //const nombreRango = rangoUsuario ? rangoUsuario.nombre : "Sin rango";

    const hashUsuario = interchatInfoProf.interchatID

    client.guilds.cache.forEach(async srv => {
        try {
            const interchatSettings = await dbModel.find({ guildID: srv.id });
            
            if (interchatSettings.length > 0) {
                // Recorrer cada configuración y enviar el mensaje al canal correspondiente
                interchatSettings.forEach(setting => {
                    const interchatChannel = client.channels.cache.get(setting.channelID);
                    if (interchatChannel) {
                        interchatChannel.send(message)
                            .then(() => console.log(`Mensaje enviado a ${srv.name} en el canal ${interchatChannel.id}`))
                            .catch(err => console.error(`No se pudo enviar el mensaje a ${srv.name} en el canal ${interchatChannel.id}:`, err));
                    }
                });
            }
        } catch (e) {
            console.error(`Error al procesar el servidor ${srv.name}:`, e);
        }
    });
}