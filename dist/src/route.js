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
        encrypt: true,
        trustServerCertificate: true,
        integratedSecurity: true,
    },
};
const poolPromise = new mssql_1.default.ConnectionPool(sqlConfig)
    .connect()
    .then(pool => {
    console.log('Conexão com SQL Server bem-sucedida');
    return pool;
})
    .catch((err) => {
    if (err instanceof Error) {
        console.error('Erro ao conectar ao SQL Server:', err.message);
    }
    else {
        console.error('Erro desconhecido ao conectar ao SQL Server:', err);
    }
    throw err;
});
exports.db = poolPromise;
//# sourceMappingURL=route.js.map