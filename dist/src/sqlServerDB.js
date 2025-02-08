"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const tslib_1 = require("tslib");
const mssql_1 = tslib_1.__importDefault(require("mssql"));
const sqlConfig = {
    user: '',
    password: '',
    server: 'VASC\\MSSQLSERVER01',
    database: 'ufc_assistencia',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        integratedSecurity: true,
    },
};
exports.db = mssql_1.default.connect(sqlConfig)
    .then(pool => pool)
    .catch(err => {
    console.error('Erro ao conectar ao SQL Server:', err.message);
    throw err;
});
//# sourceMappingURL=sqlServerDB.js.map