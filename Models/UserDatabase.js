let mongoose = require("mongoose"),
schema = new mongoose.Schema({
    userID: { type: String }, 
    apodo: { type: String },
    interchatID: { type: String },
    rank: { type: Array },
    dinero: { type: Number }, 
    isVip: { type: Boolean }, 
    fechaCreacion: { type: Date, default: Date.now },
    badges: { type: Array },
    blacklist: { type: Boolean }
})
module.exports = mongoose.model('UserDatabase', schema) 