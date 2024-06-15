const Usuario = require('../Ranks/usuario.js');
const Vip = require('../Ranks/vip.js');
const BugHunter = require('../Ranks/bughunter.js');
const Mod = require('../Ranks/mod.js');
const Admin = require('../Ranks/admin.js');
const SuperAdmin = require('../Ranks/superadm.js');
const Developer = require('../Ranks/dev.js');
const owner = require('../Ranks/owner.js');

const ranks = {
    Usuario,
    Vip,
    BugHunter,
    Mod,
    Admin,
    SuperAdmin,
    Developer,
    owner
};

console.log("[DEBUG] Rank Manager:", ranks); 

module.exports = ranks;
