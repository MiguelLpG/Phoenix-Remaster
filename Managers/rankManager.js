// Importar todos los rangos
const Usuario = require('../Ranks/usuario.js');
const Vip = require('../Ranks/vip.js');
const BugHunter = require('../Ranks/bughunter.js');
const Mod = require('../Ranks/mod.js');
const Admin = require('../Ranks/admin.js');
const SuperAdmin = require('../Ranks/superadm.js');
const Developer = require('../Ranks/dev.js');
const Owner = require('../Ranks/owner.js');

// Exportar los rangos como un objeto
module.exports = {
    Usuario,
    Vip,
    BugHunter,
    Mod,
    Admin,
    SuperAdmin,
    Developer,
    Owner
};
