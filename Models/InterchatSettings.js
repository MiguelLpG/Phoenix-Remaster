let mongoose = require("mongoose"),
schema = new mongoose.Schema({
    guildID: { type: String }, 
    guildOwner: { type: String }, 
    channelID: { type: String },
    isVip: { type: String }
})
module.exports = mongoose.model('InterchatSettings', schema) 